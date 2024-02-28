# hyperion-led-mapper

This project is intended to be used as a companion software to [Hyperion](https://github.com/hyperion-project/hyperion.ng) for use with placing fixtures inside of a screen for more complex use cases than the bias lighting it is originally intended for. Hyperion contains integrations with multiple sources and varied outputs such as WLED and Art-Net. To this end, it *can* be used for other projects natively, and the [LED Layout](https://docs.hyperion-project.org/en/user/advanced/Advanced.html#led-layout) specification supports this. The only issue, that I have found, is the layout tools only support a "frame" and "wall" layout at this time. That said, by manually updating the "Generated/Current LED Configuration" section, one can achieve a far more complex configuration. This tool will output such a configuration as can be pasted into Hyperion to provide custom fixture support, to this end.

## Screen

Two sets of parameters will be required to design a screen layout for your custom application:

* Output resolution (1920x1080, 1280x800, et al)
* Physical dimensions (e.g. 84.5"x53" for a 16:10 aspect ratio projection with 100" diagonal)

## Fixtures

Fixture parameters will require you provide physical dimensions as well as LED placement within the fixtures.

TODO:

* Ideally we will be able to upload an SVG and manually place LEDs, then save that along with physical size as a configured fixture.
* Draw a fixture?

## Support

Contact (Jacob Roufa)[jacob.roufa@gmail.com] for support, or create an issue or pull request with specific details, bugs, or requests.