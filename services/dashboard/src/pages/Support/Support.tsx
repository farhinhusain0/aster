import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MessageIcon from "@mui/icons-material/Message";
import CardContent from "@mui/joy/CardContent";
import CardActions from "@mui/joy/CardActions";
import Button from "@mui/joy/Button";
import Link from "@mui/joy/Link";
import Grid from "@mui/joy/Grid";

function SupportPage() {
  return (
    <Box display="flex-column" width="100%" height="100%">
      <Typography level="h2">Support</Typography>
      <Typography sx={{ mt: "12px", mb: "20px" }}>
        We are here to help in case of questions or issues. Pick the channel
        that is most convenient for you!
      </Typography>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid xs={4}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center">
                <CalendarMonthIcon sx={{ mr: "8px" }} />
                <Typography level="title-lg">Schedule Call</Typography>
              </Box>
              <Typography level="body-md" sx={{ ml: "2px", mt: "8px" }}>
                Schedule a call with the founder.
              </Typography>
            </CardContent>
            <CardActions buttonFlex="0 1 150px">
              <Button variant="solid" color="neutral">
                <Link
                  overlay
                  href="https://calendly.com/razinatworklife/tour"
                  target="_blank"
                  underline="none"
                  sx={{ all: "unset" }}
                >
                  Schedule a Call
                </Link>
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid xs={4}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center">
                <MessageIcon sx={{ mr: "8px" }} />
                <Typography level="title-lg">Chat</Typography>
              </Box>
              <Typography level="body-md" sx={{ ml: "2px", mt: "8px" }}>
                Get quick support from us using the chat.
              </Typography>
            </CardContent>
            <CardActions buttonFlex="0 1 120px">
              <Button
                variant="solid"
                color="neutral"
                // @ts-expect-error:next-line
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => window.$chatwoot.toggle("open")}
              >
                Start Chat
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export { SupportPage };
