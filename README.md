# hyperion-led-mapper

This project is intended to be used as a companion software to [Hyperion](https://github.com/hyperion-project/hyperion.ng) for use with placing fixtures inside of a screen for more complex use cases than the bias lighting it is originally intended for. Hyperion contains integrations with multiple sources and varied outputs such as WLED and Art-Net. To this end, it *can* be used for other projects natively, and the [LED Layout](https://docs.hyperion-project.org/en/user/advanced/Advanced.html#led-layout) specification supports this. The only issue, that I have found, is the layout tools only support a "frame" and "wall" layout at this time. That said, by manually updating the "Generated/Current LED Configuration" section, one can achieve a far more complex configuration. This tool will output such a configuration as can be pasted into Hyperion to provide custom fixture support, to this end.

## Maps

The application is capable of creating and working with multiple maps. These are held in LocalStorage in your browser. If only one map exists, it will be loaded by default when the application loads. If there are multiple maps, choose "Set Active" to load one. Once a map has a screen and one or more fixtures configured, choose "Export" to get a Hyperion LED Layout.

TODO:

* Finish Export functionality

## Fixtures

Fixture parameters will require you provide a name and physical outer dimensions as well as LED placement within the fixture and a shape to conform to. LED Offset determines starting position and can be positive or negative up to the number of LEDs in the layout. LED Position finely adjusts the placement of your LEDs; use this to tune the location of your lights based upon your physical fixture.

TODO:

* Upload an SVG and convert to a path
* Fix typing issue with `ngon` and `star` shapes
* Correct Polygon and Star sizes

## Screen

Two sets of parameters will be required to design a screen layout for your custom application:

* Physical dimensions (e.g. 80" x 50" for a 16:10 aspect ratio projection with 100" diagonal)
* Aspect ratio -- select from `1:1`, `4:3`, `16:10`, and `16:9`

## Support

Contact (Jacob Roufa)[jacob.roufa@gmail.com] for support, or create an issue or pull request with specific details, bugs, or requests.