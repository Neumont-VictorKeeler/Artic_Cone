import { Stage, Layer, Circle } from 'react-konva';

function Canvas(props) {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Circle x={200} y={100} radius={500} fill="green" />
      </Layer>
    </Stage>
  );
}

export default Canvas;

/*To import into a page please use this code:
import dynamic from 'next/dynamic';

const MyCanvas = dynamic(() => import('../components/MyCanvas'), {
  ssr: false,
}); */