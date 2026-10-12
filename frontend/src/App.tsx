import { useState } from "react";
import {
  Button,
  Container,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Alert,
} from "@mantine/core";
import { useAddTransactionMutation } from "./services/api";
import { FileUpload } from "./components/FileUpload";
import Dashboard from "./pages/Dashboard";

function App() {
  const [description, setDescription] = useState("");

  const [addTransaction, { data, error, isLoading }] =
    useAddTransactionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      return;
    }

    try {
      await addTransaction({
        description: description.trim(),
      }).unwrap();

      setDescription("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Frontend → Backend</Title>

        <Paper withBorder p="lg" radius="md">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Transaction"
                placeholder="Enter transaction"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />

              <Button type="submit" loading={isLoading}>
                Add Transaction
              </Button>
            </Stack>
          </form>
        </Paper>

        {error && (
          <Alert color="red" title="Error">
            Failed to add transaction
          </Alert>
        )}

        {data && (
          <Paper withBorder p="lg" radius="md">
            <Stack gap="xs">
              <Title order={2}>Backend Response</Title>

              <Text>{data.description}</Text>
            </Stack>
          </Paper>
        )}

        <Title order={2}>Import Transactions</Title>

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
