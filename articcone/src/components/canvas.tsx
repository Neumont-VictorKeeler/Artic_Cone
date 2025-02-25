"use client";
import React, {useImperativeHandle, useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
type SliderProps = React.ComponentProps<typeof Slider>
 
const Canvas = React.forwardRef( (props: SliderProps, ref: React.Ref<unknown>  ) => {
  const [lines, setLines] = useState<{size: number; points: number[]; color: string }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("white"); // For fill bucket
  const stageRef = useRef<any>(null);
  const [color, setColor] = useState("black");
  const [tool, setTool] = useState("pen");
  const [size, setSize] = useState([3]);
  const [allowed, setAllowed] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(900);
  const [canvasHeight, setCanvasHeight] = useState(500);
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth / 1.55);
      setCanvasHeight(window.innerHeight / 1.27);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  })
  useImperativeHandle(ref, () => ({
    disableCanvas() {
        console.log("Canvas Disabled");
        setAllowed(false);
    },
    enableCanvas() {
        console.log("Canvas Enabled");
        setAllowed(true);
    }
}));
  const handleMouseDown = (e: any) => {
    if (tool === "fill") {
      const stage = stageRef.current;
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;
      console.log(pos);
      fillArea(pos.x, pos.y, color);
      return;
    }
  
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
  
    setLines([...lines, { size: size[0], points: [pos.x, pos.y], color: tool === "eraser" ? "white" : color }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || tool === "fill" || !allowed) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    setLines(lines.slice(0, lines.length - 1).concat(lastLine));
  };

  const handleMouseUp = () => setIsDrawing(false);

  const clearCanvas = () => {
    setLines([]);
    setBackgroundColor("white");
  };
  
  const fillArea = (x: number, y: number, fillColor: string) => {
    const stage = stageRef.current;
    if (!stage) return;
  
    // Convert stage to an image
    const dataURL = stage.toDataURL();
    
    // Create an offscreen canvas
    const img = new window.Image();
    img.src = dataURL;
  
    img.onload = () => {
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = stage.width();
      offscreenCanvas.height = stage.height();
      const ctx = offscreenCanvas.getContext("2d");
if (!ctx) return;
ctx.drawImage(img, 0, 0);
      
// Get pixel data
const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
const pixels = imageData.data;
const startIndex = (Math.floor(y) * offscreenCanvas.width + Math.floor(x)) * 4;
const targetColor = pixels.slice(startIndex, startIndex + 4); // [R, G, B, A]
if (arraysEqual(targetColor, Array.from(hexToRGBA(fillColor)))) return;
floodFill(pixels, Math.floor(x), Math.floor(y), Array.from(targetColor), hexToRGBA(fillColor), offscreenCanvas.width, offscreenCanvas.height);
ctx.putImageData(imageData, 0, 0);
  
// Update Konva stage with the filled image
const filledImage = new window.Image();
filledImage.src = offscreenCanvas.toDataURL();
filledImage.onload = () => {
  setLines([]); // Clear lines to avoid redrawing over the filled space
  setBackgroundColor(fillColor); // Set filled area color
};
    };
  };
  
  // Flood fill algorithm
  const floodFill = (pixels: Uint8ClampedArray, x: number, y: number, targetColor: number[], fillColor: number[], width: number, height: number) => {
    const stack = [[x, y]];
    const visited = new Set<number>();
  
    while (stack.length) {
      const poppedVal = stack.pop();
      if (!poppedVal) continue;
      const [px, py] = poppedVal;
      const index = (py * width + px) * 4;
      
      if (px < 0 || py < 0 || px >= width || py >= height || visited.has(index)) continue;
      visited.add(index);
      const targetColorArray = Uint8ClampedArray.from(targetColor);
      if (!colorMatch(pixels, index, targetColorArray)) continue;
  
      setColorAt(pixels, index, fillColor);
  
      stack.push([px - 1, py]);
      stack.push([px + 1, py]);
      stack.push([px, py - 1]);
      stack.push([px, py + 1]);
    }
  };
  const colorMatch = (pixels: { [x: string]: any; }, index: number, targetColor: Uint8ClampedArray<ArrayBufferLike>) => {
    return (
      pixels[index] === targetColor[0] &&
      pixels[index + 1] === targetColor[1] &&
      pixels[index + 2] === targetColor[2] &&
      pixels[index + 3] === targetColor[3]
    );
  };
  
  const setColorAt = (pixels: { [x: string]: any; }, index: number, fillColor: any[]) => {
    pixels[index] = fillColor[0];
    pixels[index + 1] = fillColor[1];
    pixels[index + 2] = fillColor[2];
    pixels[index + 3] = fillColor[3];
  };
  const hexToRGBA = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };
  const arraysEqual = (a: Uint8ClampedArray<ArrayBuffer>, b: number[]) => JSON.stringify(a) === JSON.stringify(b);
  return (

    <div className="flex w-full  h-full items-center justify-center mx-auto p-1">
      <div className="relative items-center justify-center border-2 border-gray-300 rounded-lg overflow-hidden m-2">
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          className="bg-white"
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            <Rect width={canvasWidth} height={canvasHeight} fill={backgroundColor} />
            {lines.map((line, i) => (
              <Line key={i} points={line.points} stroke={line.color} strokeWidth={line.size} tension={0.5} lineCap="round" lineJoin="round" />
            ))}
          </Layer>
        </Stage>
      </div>
      {/* Tool box */}
      <div className={`w-50  bg-gray-100 flex flex-col items-center  shadow-md rounded-lg  ${allowed ? '' : 'hidden'}`}>
  {/* Clear Canvas Button */}
  <Button
    onClick={clearCanvas}
    className="w-[27%] h-[20%] rounded-full mt-2 bg-white border-2 border-red-500 text-red-500 flex items-center justify-center"
  >
    ❌
  </Button>

  {/* Color Palette */}
  <div className="flex grid grid-cols-2 w-full h-full p-/ gap-2 items-center">
    {[
      { color: "white", bg: "bg-white" , hoverbg:"hover:bg-gray-100"},
      { color: "black", bg: "bg-black" , hoverbg:"hover:bg-gray-600"},
      { color: "red", bg: "bg-red-500" , hoverbg:"hover:bg-red-400"},
      { color: "blue", bg: "bg-blue-500" , hoverbg:"hover:bg-blue-400"},
      { color: "green", bg: "bg-green-500" , hoverbg:"hover:bg-green-400"},
      { color: "yellow", bg: "bg-yellow-500", hoverbg:"hover:bg-yellow-300" },
      { color: "purple", bg: "bg-purple-800", hoverbg:"hover:bg-purple-700" },
      { color: "orange", bg: "bg-orange-500" , hoverbg:"hover:bg-orange-300"},
    ].map(({ color, bg , hoverbg}) => (
      <Button
        key={color}
        onClick={() => setColor(color)}
        className={`flex  ${bg} w-[90%] h-[90%] m-1 rounded-full border-2 border-gray-300 ${hoverbg} items-center justify-center`}
      />
    ))}
  </div>

  {/* Tool Buttons */}
  <div className="grid grid-cols-1 w-full justify-center items-center gap-2 ">
    {[
      { toolName: "pen", icon: "✏️", bg: "bg-white", hoverbg:"hover:bg-gray-100" },
      { toolName: "eraser", icon: "🧽", bg: "bg-red-300", hoverbg:"hover:bg-pink-400" },
      { toolName: "fill", icon: "🪣", bg: "bg-yellow-300" , hoverbg:"hover:bg-red-500"},
    ].map(({ toolName, icon, bg , hoverbg}) => (
      <Button
        key={toolName}
        onClick={() => setTool(toolName)}
        className={`flex items-center justify-center w-[90%] h-[90%] rounded-full border-2 mx-auto ${hoverbg} ${
          tool === toolName ? "border-gray-700 border-4" : "border-gray-300"
        } ${bg}`}
      >
        {icon}
      </Button>
    ))}
  </div>

  {/* Brush Size Slider */}
  <div className="flex flex-col items-center w-[90%] bg-slate-500 m-2 rounded-md border-2 border-stone-800">
    <Slider
      orientation="vertical"
      onValueChange={(value) => setSize(value)}
      defaultValue={[3]}
      max={100}
      min={1}
      step={1}
      className="cursor-pointer h-24"
    />
    <div className="flex justify-center items-center bg-zinc-500 border-t-2 border-stone-800 rounded-b-md w-full py-1">
      <p className="text-xs font-bold text-stone-100">{size}</p>
    </div>
  </div>
</div>

    </div>
  );
});

export default Canvas;