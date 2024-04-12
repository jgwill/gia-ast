import cv2
import argparse

def _read_image(filename):
    img = cv2.imread(filename)
    return img
def _automatic_brightness_and_contrast(image, clip_hist_percent=25):
    if isinstance(image, str):
        image = _read_image(image)
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist_size = len(hist)
    
    accumulator = []
    accumulator.append(float(hist[0][0]))  # Extract single element from array
    for index in range(1, hist_size):
        accumulator.append(accumulator[index - 1] + float(hist[index][0]))  # Extract single element from array
    
    maximum = accumulator[-1]
    clip_hist_percent *= maximum / 100.0
    clip_hist_percent /= 2.0
    
    minimum_gray = 0
    while accumulator[minimum_gray] < clip_hist_percent:
        minimum_gray += 1
    
    maximum_gray = hist_size - 1
    while accumulator[maximum_gray] >= (maximum - clip_hist_percent):
        maximum_gray -= 1
    
    alpha = 255 / (maximum_gray - minimum_gray)
    beta = -minimum_gray * alpha
    
    auto_result = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    return (auto_result, alpha, beta)
def correct(filename, abc=25, output_filename=None):
    img = _read_image(filename)
    img, alpha, beta = _automatic_brightness_and_contrast(img, abc)
    
    file_extension = filename.split(".")[-1].lower()
    abc_fn_suffix = str(abc).zfill(2)
    
    new_filename = output_filename if output_filename else filename.replace("." + file_extension, "_abc" + abc_fn_suffix + "." + file_extension)
    cv2.imwrite(new_filename, img)
    print("Brightness and contrast corrected image saved as", new_filename)
    
    return img, alpha, beta

def main():
    parser = argparse.ArgumentParser(description='Image Brightness and Contrast Correction')
    parser.add_argument('filename', type=str, help='input image filename')
    parser.add_argument('-a','--abc', type=int, default=15, help='automatic brightness and contrast percentage (default: 25)')
    parser.add_argument('-o','--output', type=str, help='output image filename')
    
    args = parser.parse_args()
    
    correct(args.filename, args.abc, args.output)

if __name__ == '__main__':
    main()