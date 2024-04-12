.PHONY: clean build upload

clean:
    rm -rf dist
    rm -rf astabc.egg-info

build: clean
    python setup.py sdist bdist_wheel

upload: build
    twine upload dist/*
