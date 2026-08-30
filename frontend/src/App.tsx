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
import {
  useTestQuery,
  useAddTransactionMutation,
} from "./services/api";

function App() {
  const {
    data: testData,
    error: testError,
    isLoading: testLoading,
  } = useTestQuery();

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

  if (testLoading) {
    return (
      <Container size="sm" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (testError) {
    console.error(testError);

    return (
      <Container size="sm" py="xl">
        <Alert color="red" title="Connection Error">
          Backend connection failed
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>Frontend → Backend</Title>

        <Text>
          Backend says: <strong>{testData}</strong>
        </Text>

        <Paper withBorder p="lg" radius="md">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Transaction"
                placeholder="Enter transaction"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
              />

              <Button
                type="submit"
                loading={isLoading}
              >
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
      </Stack>
    </Container>
  );
}

export default App;
