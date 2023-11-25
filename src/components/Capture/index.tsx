import html2canvas from "html2canvas";

const Capture = () => {
  const onCapture = () => {
    console.log("onCapture");
    const targetElement = document.getElementById("video-container");
    if (targetElement) {
      html2canvas(targetElement)
        .then((canvas) => {
          onSavaAs(canvas.toDataURL("image/png"), "image-download.png");
        })
        .catch((error) => {
          console.error("html2canvas error:", error);
        });
    } else {
      console.error("Target element not found");
    }
  };

  const onSavaAs = (uri, filename) => {
    console.log("onSavaAs");
    var link = document.createElement("a");
    document.body.appendChild(link);
    link.href = uri;
    link.download = filename;
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button onClick={onCapture}>Capture</button>
    </div>
  );
};

export default Capture;
