import ScratchCard from "@/components/SecretCard";

const TestPage = () => {
  return (
    <div>
      <h1>Test Page</h1>
      <ScratchCard imageSrc="/dan.jpeg" brushSize={20} revealPercent={50} />
    </div>
  );
};

export default TestPage;
