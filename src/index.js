import React, { Component } from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Image, Text } from 'react-konva';
import Konva from 'konva'
import useImage from 'use-image';

// the first very simple and recommended way:


// custom component that will handle loading image from url
// you may add more logic here to handle "loading" state
// or if loading is failed
// VERY IMPORTANT NOTES:
// at first we will set image state to null
// and then we will set it to native image instance when it is loaded
class URLImage extends React.Component {
  state = {
    image: null
  };
  componentDidMount() {
    this.loadImage();
  }
  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }
  componentWillUnmount() {
    this.image.removeEventListener('load', this.handleLoad);
  }
  loadImage() {
    // save to "this" to remove "load" handler on unmount
    this.image = new window.Image();
    this.image.src = this.props.src;
    this.image.addEventListener('load', this.handleLoad);
  }
  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    this.setState({
      image: this.image
    });
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };
  render() {
    return (
      <Image
        x={this.props.x}
        y={this.props.y}
        image={this.state.image}
        ref={node => {
          this.imageNode = node;
        }}
      />
    );
  }
}

const Video = ({ src }) => {
  const imageRef = React.useRef(null);
  const [size, setSize] = React.useState({ width: 50, height: 50 });

  // we need to use "useMemo" here, so we don't create new video elment on any render
  const videoElement = React.useMemo(() => {
    const element = document.createElement("video");
    element.src = src;
    return element;
  }, [src]);

  // when video is loaded, we should read it size
  React.useEffect(() => {
    const onload = function() {
      setSize({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });
    };
    videoElement.addEventListener("loadedmetadata", onload);
    return () => {
      videoElement.removeEventListener("loadedmetadata", onload);
    };
  }, [videoElement]);

  // use Konva.Animation to redraw a layer
  React.useEffect(() => {
    videoElement.play();
    const layer = imageRef.current.getLayer();

    const anim = new Konva.Animation(() => {}, layer);
    anim.start();

    return () => anim.stop();
  }, [videoElement]);

  return (
    <Image
      ref={imageRef}
      image={videoElement}
      x={150}
      y={400}
      stroke="red"
      width={size.width}
      height={size.height}
      draggable
    />
  );
};


class App extends Component {
  render() {
    return (
        <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <div>
            <Text text="Harshvardhan Sahu skill test." fontSize={15} x={150}/>
          </div>
          <URLImage src="https://konvajs.org/assets/yoda.jpg" x={150} y = {150}/>

          <Video src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm"  />
 
        </Layer>
      </Stage>  
      </>
      
    );
  }
}

render(<App />, document.getElementById('root'));
