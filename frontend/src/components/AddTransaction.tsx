import { useState } from "react";
import {
  Alert,
  Button,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useAddTransactionMutation } from "../services/api";

type TransactionType = "Expense" | "Income";

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function AddTransaction() {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getLocalDate());
  const [amount, setAmount] = useState<number | string>("");
  const [type, setType] = useState<TransactionType>("Expense");
  const [submittedTransaction, setSubmittedTransaction] = useState<{
    description: string;
    date: string;
    amount: number;
  } | null>(null);

  const [addTransaction, { error, isLoading }] = useAddTransactionMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (
      !description.trim() ||
      !date ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return;
    }

    const signedAmount =
      Math.abs(numericAmount) * (type === "Expense" ? -1 : 1);

    const payload = {
      description: description.trim(),
      date,
      amount: signedAmount,
    };

    try {
      await addTransaction(payload).unwrap();

      setSubmittedTransaction(payload);

      setDescription("");
      setDate(getLocalDate());
      setAmount("");
      setType("Expense");
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  return (
    <Paper withBorder p="lg" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={2}>Add Transaction</Title>

          <TextInput
            label="Description"
            placeholder="e.g. Groceries, Salary"
            value={description}
            onChange={(e) => {
              setDescription(e.currentTarget.value);
              setSubmittedTransaction(null);
            }}
            required
          />

          <TextInput
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />

          <Stack gap={5}>
            <Text size="sm" fw={500}>
              Transaction type
            </Text>

            <SegmentedControl
              fullWidth
              value={type}
              onChange={(value) => setType(value as TransactionType)}
              data={[
                { label: "Expense", value: "Expense" },
                { label: "Income", value: "Income" },
              ]}
            />
          </Stack>

          <NumberInput
            label="Amount"
            placeholder="Enter amount"
            value={amount}
            onChange={setAmount}
            min={0}
            decimalScale={2}
            fixedDecimalScale={false}
            allowNegative={false}
            prefix="$"
            required
          />

          <Text size="sm" c={type === "Expense" ? "red" : "green"}>
            {type === "Expense"
              ? "This will be recorded as an expense (negative amount)."
              : "This will be recorded as income (positive amount)."}
          </Text>

          <Button type="submit" loading={isLoading}>
            Add Transaction
          </Button>

          {error && (
            <Alert color="red" title="Error">
              Failed to add transaction. Please try again.
            </Alert>
          )}

          {submittedTransaction && (
            <Alert color="green" title="Success">
              <Stack gap={4}>
                <Text>
                  Transaction added: {submittedTransaction.description}
                </Text>
                <Text size="sm">Date: {submittedTransaction.date}</Text>
                <Text size="sm">
                  Amount: {submittedTransaction.amount < 0 ? "-" : "+"}$
                  {Math.abs(submittedTransaction.amount).toFixed(2)}
                </Text>
              </Stack>
            </Alert>
          )}
        </Stack>
      </form>
    </Paper>
  );
}

export default AddTransaction;
