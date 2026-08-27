import { useTestQuery } from "./services/api";

function App() {
  const { data, error, isLoading } = useTestQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Backend connection failed</div>;
  }

  return (
    <div>
      <h1>Frontend → Backend</h1>
      <p>{data}</p>
    </div>
  );
}

export default App;