import React, { useEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";
import { useMotionValueEvent, useScroll, useTransform } from "framer-motion";

const App = () => {
  const [vals, setVals] = useState({
    currentIndex: 0,
    maxIndex: 240,
  });

  const imagesLoaded = useRef(0);
  const imagesArr = useRef([]);
  const canvasRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    preLoadImages();
  }, []);

  const preLoadImages = () => {
    for (let i = 1; i <= vals.maxIndex; i++) {
      // Start loop at 1 for images named 001 to 240
      const img = new Image();
      img.src = `./images/${i.toString().padStart(3, 0)}.jpg`;
      img.onload = () => {
        imagesLoaded.current++;
        if (imagesLoaded.current === vals.maxIndex) {
          console.log("All images loaded");
          loadImage(1); // Start with the first image (index 1)
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image at index ${i}`);
      };
      imagesArr.current.push(img);
    }
  };

  const loadImage = (index) => {
    if (index >= 1 && index <= vals.maxIndex) {
      // Adjust range to 1 through 240
      const img = imagesArr.current[index - 1]; // Adjust to 0-based index for array
      const canvas = canvasRef.current;

      if (!canvas || !img) {
        console.error("Canvas or Image is missing", { index, img });
        return;
      }

      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.max(scaleX, scaleY);

      const newWidth = img.width * scale;
      const newHeight = img.height * scale;

      const offsetX = (canvas.width - newWidth) / 2;
      const offsetY = (canvas.height - newHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
      console.log("Loaded image: ", index);

      setVals({ ...vals, currentIndex: index });
    }
  };

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start", "end center"],
  });

  const indexVal = useTransform(scrollYProgress, [0, 1], [1, vals.maxIndex]);

  useMotionValueEvent(indexVal, "change", (latest) => {
    const index = Math.round(latest);
    if (index !== vals.currentIndex) {
      loadImage(index);
    }
  });

  return (
    <>
      <ReactLenis root>
        <div className="h-screen w-full bg-black"></div>
        <main
          ref={targetRef}
          className="h-[3000vh] border-y-4 border-yellow-600 overflow-clip relative"
        >
          <div className="sticky top-0">
            <canvas ref={canvasRef}></canvas>
          </div>
        </main>
        <div className="h-screen w-full bg-black"></div>
      </ReactLenis>
    </>
  );
};

export default App;
