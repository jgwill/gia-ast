.PHONY: clean
clean:
        find . -name "*.pyc" -print0 | xargs -0 rm -f
        rm -Rf dist
        rm -Rf *.egg-info



.PHONY: dist
dist:
        make clean
        python setup.py sdist --format=gztar bdist_wheel


.PHONY: pypi-release
pypi-release:
        twine --version
        twine upload -s dist/*

.PHONY: release
release:
        make dist
        git tag -s abc-$(version)
        git push origin abc-$(version)
        make pypi-release