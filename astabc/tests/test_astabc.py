import unittest
import cv2
import astabc.astabc as astabc

class TestAstabc(unittest.TestCase):
    def test_read_image(self):
        # Test reading an image
        filename = "test_image.jpg"
        img = astabc._read_image(filename)
        self.assertIsNotNone(img)
    
    def test_automatic_brightness_and_contrast(self):
        # Test automatic brightness and contrast optimization
        image = cv2.imread("test_image.jpg")
        result, alpha, beta = astabc._automatic_brightness_and_contrast(image)
        self.assertIsNotNone(result)
        self.assertIsNotNone(alpha)
        self.assertIsNotNone(beta)
    
    def test_correct(self):
        # Test image correction
        filename = "test_image.jpg"
        abc = 25
        output_filename = "corrected_image.jpg"
        img, alpha, beta = astabc.correct(filename, abc, output_filename)
        self.assertIsNotNone(img)
        self.assertIsNotNone(alpha)
        self.assertIsNotNone(beta)
    
        # Additional assertions for the output file
        corrected_img = cv2.imread(output_filename)
        self.assertIsNotNone(corrected_img)
        self.assertEqual(corrected_img.shape, img.shape)
    
        # Clean up the output file
        cv2.imwrite(output_filename, img)
    
if __name__ == "__main__":
    unittest.main()