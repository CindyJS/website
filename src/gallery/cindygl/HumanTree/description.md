To see this example you have to stand up such that your webcam sees your entire body. Sketch your arms widely! We recommend the use of Firefox or Chrome for proper detection.

A neural network detects the pose of the captured person. Two similarities map each of the two segments from a shoulder and the elbow to the trunk of the perso. The applet renders an [Iterated function system](https://en.wikipedia.org/wiki/Iterated_function_system) based on these two similarities via a Feedback loop-approach.


##### Software:
  The pose is detected with the [PoseNet Model](https://github.com/tensorflow/tfjs-models/tree/master/posenet) using [TensorFlow.js](https://js.tensorflow.org/). Due to WebGL precision problems, The PoseNet works less accurate in Safari.
  
  The transformations of the image are computed via [CindyGL](https://cindyjs.org/docs/cindygltutorial/)

##### Widget Author:
  Aaron Montag, Idea from [MoMath](https://momath.org/).
