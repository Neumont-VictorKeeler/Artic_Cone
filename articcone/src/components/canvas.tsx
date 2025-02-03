import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const MyCanvas = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect x={20} y={20} width={100} height={50} fill="red" />
      </Layer>
    </Stage>
  );
};

export default MyCanvas;
/*To import into a page please use this code:
import dynamic from 'next/dynamic';

const MyCanvas = dynamic(() => import('../components/MyCanvas'), {
  ssr: false,
}); */