import os
import shutil
import asyncio
from bson import ObjectId

if os.getenv("OS_ENV") == "linux":
    import pysqlite3  # type: ignore
    import sys

    sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")

from dotenv import load_dotenv, find_dotenv
from pydantic import BaseModel
import uvicorn
from db import init_db
from db.organization import organization_model
from db.job import job_model
from db.snapshot import snapshot_model
from db.db_types import Job

if os.getenv("IS_DOCKER") != "true":
    load_dotenv(find_dotenv("../../.env"), override=True)
    load_dotenv(find_dotenv(".env"), override=True)

from build import build_snapshot

from typing import List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException

app = FastAPI()


class BuildSnapshotRequestData(BaseModel):
    organizationId: str
    dataSources: Optional[List[str]] = None


class DeleteSnapshotsRequestData(BaseModel):
    organizationId: str


# Root route
@app.get("/")
async def root():
    return {"message": "Data processor API! 🚀"}


@app.post("/build-snapshot", response_model=Job)
async def start_build_snapshot(
    data: BuildSnapshotRequestData, background_tasks: BackgroundTasks
):

    print("Inside build-snapshot")

    organization_id = data.organizationId
    data_sources = data.dataSources

    print(f"Getting orgainzation with id {organization_id} datasources {str(data_sources)}")
    organization = await organization_model.get_one_by_id(organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")

    print("Creating job")
    job = await job_model.create(
        data={
            "type": "ingest-knowledge",
            "status": "pending",
            "phase": "collecting-documents",
            "organization": ObjectId(organization_id),
        }
    )

    print(f"Adding background task for snapshot building with job id {job.id}")
    background_tasks.add_task(
        build_snapshot,
        job_id=job.id,
        data_sources=data_sources,
    )

    print("returning job")
    return job


@app.post("/delete-snapshots")
async def delete_snapshots(data: DeleteSnapshotsRequestData):
    """Delete snapshot folders from the file system for an organization."""
    organization_id = data.organizationId

    print(f"Deleting snapshots for organization {organization_id}")

    # Get all snapshots for the organization
    snapshots = await snapshot_model.get({"organization": ObjectId(organization_id)})

    # Delete snapshot folders from file system
    snapshots_directory = os.getenv("SNAPSHOTS_DIRECTORY")
    if not snapshots_directory:
        print("SNAPSHOTS_DIRECTORY not set, skipping snapshot folder deletion")
        return {"message": "SNAPSHOTS_DIRECTORY not set", "deleted_count": 0}

    deleted_count = 0
    for snapshot in snapshots:
        snapshot_id = str(snapshot.id)
        snapshot_folder_path = os.path.join(snapshots_directory, snapshot_id)
        try:
            if os.path.exists(snapshot_folder_path):
                await asyncio.to_thread(shutil.rmtree, snapshot_folder_path)
                print(f"Deleted snapshot folder: {snapshot_folder_path}")
                deleted_count += 1
        except Exception as err:
            print(f"Failed to delete snapshot folder {snapshot_folder_path}: {err}")
            # Continue with deletion even if folder deletion fails

    print(f"Deleted {deleted_count} snapshot folder(s)")
    return {"message": "Snapshots deleted", "deleted_count": deleted_count}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 3002))
    reload = os.getenv("RELOAD", "true") == "true"
    mongo_uri = os.getenv("MONGO_URI")

    init_db(mongo_uri)

    uvicorn.run("main:app", port=port, reload=reload, host="0.0.0.0")
