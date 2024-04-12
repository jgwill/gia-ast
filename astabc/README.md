# astabc

The `astabc` module is a Python module that provides functions for automatic brightness and contrast optimization of images.

## Installation

You can install the `astabc` module using `pip`:

```shell
pip install astabc
```

## Usage

```python
import astabc

# Read an image from a file
image = astabc._read_image('filename.jpg')

# Perform automatic brightness and contrast optimization
result, alpha, beta = astabc._automatic_brightness_and_contrast(image)

# Correct the brightness and contrast of an image
astabc.correct('filename.jpg', abc=25, output_filename='output.jpg')
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.