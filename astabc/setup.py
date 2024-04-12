from setuptools import setup

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name="astabc",
    version="1.0.0",
    author="Guillaume Descoteaux-Isabelle",
    description="A Python module for automatic brightness and contrast optimization",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/jgwill/gia-ast/astabc",
    packages=["astabc"],
    install_requires=["opencv-python"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)