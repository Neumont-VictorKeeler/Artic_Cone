"use client";
import React, {useImperativeHandle, useRef, useState } from "react";
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

    <div className="flex h-fill items-center justify-center mx-5">
      <div className="flex items-center justify-center border-2 border-gray-300 rounded-lg overflow-hidden">
        <Stage
          width={900}
          height={500}
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
            <Rect width={1200} height={800} fill={backgroundColor} />
            {lines.map((line, i) => (
              <Line key={i} points={line.points} stroke={line.color} strokeWidth={line.size} tension={0.5} lineCap="round" lineJoin="round" />
            ))}
          </Layer>
        </Stage>
      </div>
      <div className={`w-[100px] h-4/5 bg-gray-100 justify items-center justify-center space-y-4 p-4 shadow-md rounded-lg mx-5 mt-20 mb-20 ${allowed ? '' : 'hidden'}`}>
        <Button onClick={clearCanvas} className="w-12 h-12 rounded-full bg-white border-2 border-red-500 text-red-500 flex items-center justify-center translate-x-2">
          ❌
        </Button>
        <div className="self-center -translate-x-2">
        <table >
            <td>
              <tr>
                <Button
                onClick={() => setColor("white")}
                className="bg-white w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-black"></Button>
              </tr>
              <tr>
                <Button
                onClick={() => setColor("red")}
                className="bg-red-500 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
              <tr>
                <Button
                onClick={() => setColor("green")}
                className="bg-green-500 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
              <tr>
                <Button
                onClick={() => setColor("purple")}
                className="bg-purple-800 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
            </td>
            <td>
              <tr>
                <Button
                onClick={() => setColor("black")}
                className="bg-black w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
              
              <tr>
                <Button
                onClick={() => setColor("blue")}
                className="bg-blue-500 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
              <tr>
                <Button
                onClick={() => setColor("yellow")}
                className="bg-yellow-500 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
              <tr>
                <Button
                onClick={() => setColor("orange")}
                className="bg-orange-500 w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-white"></Button>
              </tr>
              </td>
        </table>
        </div>
        <div className="flex space-x-1 size-fill left-0 ">
        <table>
          <td className="items-center ">
            <tr>
              <Button
                onClick={() => setTool("pen")}
                className={`flex items-center justify-center bg-white w-10 h-10 rounded-full border-2 hover:bg-black ${
                  tool === "pen" ? "border-gray-700" : "border-gray-300"
                } flex items-center justify-center`}
                >
                ✏️
              </Button>
            </tr>
            <tr>
            <Button
          onClick={() => setTool("eraser")}
          className={`flex items-center justify-center bg-red-300 w-10 h-10 rounded-full border-2 hover:bg-white ${
            tool === "eraser" ? "border-gray-700" : "border-gray-300"
          } flex items-center justify-center`}
        >
          🧽
        </Button>
            </tr>
            <tr>
            <Button
          onClick={() => setTool("fill")}
          className={`flex items-center justify-center bg-yellow-300 w-10 h-10 rounded-full border-2 hover:bg-white ${
            tool === "fill" ? "border-gray-700" : "border-gray-300"
          } flex items-center justify-center`}
        >
          <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 112.71"><defs><style></style></defs><title>paint-bucket</title><path className="cls-1" d="M6.56,52C33.11,57.3,43.18,89.47,86.29,67.8L58,96.06s-.57.58-.63.65a7,7,0,0,1-4.29,2.56,13.6,13.6,0,0,1-4.2.24h0a21.48,21.48,0,0,1-4.8-1.06c-7.4-2.48-15.17-7.8-21.79-14.37S10.22,69.62,7.61,62.19a25.29,25.29,0,0,1-1-3.74,17.9,17.9,0,0,1-.33-3.3A12.86,12.86,0,0,1,6.56,52Z"/><path d="M110.56,84.94c-1.21-1.85-2.44-3.72-3.61-5.64-1.35,2.26-2.77,4.48-4.15,6.64-3.51,5.48-6.72,10.51-6.72,12.55,0,4.65,2.24,7.71,5.23,9.21a12.56,12.56,0,0,0,4.94,1.25,13,13,0,0,0,5.16-.74,9.49,9.49,0,0,0,6.36-8c.13-4.1-3.44-9.53-7.21-15.27Z"/><path d="M111.24,72.76c.82,3.48,3.17,7.06,5.43,10.5,3.35,5.1,6.52,9.93,6.18,15.51l0,.22a14.76,14.76,0,0,1-10,12.68,17.35,17.35,0,0,1-6.85,1,17,17,0,0,1-6.73-1.76A14.85,14.85,0,0,1,91,97c0-3.86,2.79-8.22,5.83-13,2.46-3.84,5.11-8,5.86-11.25a4.41,4.41,0,0,1,8.59,0Z"/><path className="cls-1" d="M107,73.76c2.15,9.2,12,17.11,11.5,24.75-1.49,13.54-23.07,13-23.07-1.51,0-5.18,9.72-15.25,11.57-23.24Z"/><path d="M34.65,13.77c-10.22,1.1-16.22,4.63-19,9.11a13.37,13.37,0,0,0-1.23,10.65l.09.34,20.11-20.1ZM80.8,24.89c-7.29-7.3-14.66-13-20.73-16.17C55.76,6.5,52.4,5.61,50.75,6.55l-.82.82c-1.22,2-.51,6.26,1.78,11.58A68.81,68.81,0,0,0,66.22,39.47c6.94,6.94,14.39,12.14,20.73,15,4.51,2,8.21,2.9,10.35,2.32l1.91-1.92c.45-1.91-.5-5.14-2.49-9.13C93.63,39.53,88,32.08,80.8,24.89ZM62.94,3.15c6.66,3.43,14.58,9.57,22.31,17.3S99,36.15,102.34,43c3.75,7.51,4.35,13.92.69,17.58A8.23,8.23,0,0,1,101,62L61.88,101.1c-2.35,2.37-3.33,3.37-7.38,4.28a19.93,19.93,0,0,1-6.14.36,27.5,27.5,0,0,1-6.24-1.35c-8.33-2.8-17-8.66-24.22-15.86S4.63,72.6,1.7,64.25A30.28,30.28,0,0,1,.43,59.6,23.6,23.6,0,0,1,0,55.15a15.25,15.25,0,0,1,1.23-6.81A17.84,17.84,0,0,1,5,43.42l.16-.17,4.71-4.7A24.06,24.06,0,0,1,8.65,35.1a19.15,19.15,0,0,1,1.92-15.34C14.84,12.78,24.42,7.59,41,7.42l4.17-4.16a7.06,7.06,0,0,1,1.58-1.57,2.46,2.46,0,0,1,.67-.45C51.13-1,56.62-.11,62.94,3.15ZM91.48,62.61a35.83,35.83,0,0,1-7.11-2.42c-7-3.16-15.11-8.81-22.59-16.28A75.25,75.25,0,0,1,45.94,21.43a34.92,34.92,0,0,1-2.39-7.68L17.44,39.85a25.47,25.47,0,0,0,4.1,4.58c7.26,6.43,18.87,9.69,31.64,4.22a3,3,0,0,1,2.35,5.52c-15.21,6.51-29.17,2.52-38-5.25a32,32,0,0,1-4.42-4.78L9.44,47.85A12.66,12.66,0,0,0,6.9,51a9.73,9.73,0,0,0-.64,4.14,17.9,17.9,0,0,0,.33,3.3,25.29,25.29,0,0,0,1,3.74c2.61,7.43,8,15.27,14.71,21.89S36.71,96,44.11,98.45a21.48,21.48,0,0,0,4.8,1.06h0a13.6,13.6,0,0,0,4.2-.24,7,7,0,0,0,4.29-2.56c.06-.07.64-.64.63-.65L91.48,62.61Z"/></svg>
        </Button>
          </tr>
          </td>
              </table>
          <div className="justify-center h-fill w-fill text-sm font-medium bg-slate-500 rounded-md border-2 border-stone-800">
          <Slider
              orientation="vertical"
              onValueChange={(value) => setSize(value)}
              defaultValue={[3]}
              max={100}
              min={1}
              step={1}
              className="cursor-pointer h-fill self-center"
              />  
              <div className="flex flex-col items-center bg-zinc-500 border-t-2 border-stone-800 rounded-b-md">
              <p className="size-6 w-auto text-xs text-center  items-center font-bold flex y-0 text-stone-100  ">{size}</p>
              </div>
            </div>
        </div>
        
        
      </div>
    </div>
  );
});

export default Canvas;