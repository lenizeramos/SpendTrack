import { Container, Stack } from "@mantine/core";
import { FileUpload } from "./components/FileUpload";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./components/AddTransaction";

function App() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <AddTransaction />

        <FileUpload
          onUploadSuccess={() => {
            console.log("CSV uploaded successfully");
          }}
        />

        <Dashboard />
      </Stack>
    </Container>
  );
}

export default App;
