"""
A simple selenium test example written by python
"""

import unittest
import re
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


class TestTemplate(unittest.TestCase):
    """Include test cases on a given url"""

    def setUp(self):
        """Start web driver"""
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--disable-gpu')
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)

    def tearDown(self):
        """Stop web driver"""
        self.driver.quit()

    def test_app_title(self):
        """Log in to the React Admin App with test@example.com"""
        try:
            self.driver.get('http://ra-webserver/#/login')
            assert "React Admin Low Code" in self.driver.title
        except AssertionError as ex:
            print(f"Test failure. Selenium sees:")
            print(self.driver.page_source)
            self.fail(ex)

    def test_log_in_to_app_usr1(self):
        """Log in to the React Admin App with test@example.com"""
        try:
            self.driver.get('http://ra-webserver/#/login')  # Start a page
            self.driver.find_element_by_id('username').send_keys('test@example.com')  # Type in username
            self.driver.find_element_by_id('password').send_keys('bigpassword')  # Type in password
            self.driver.find_element_by_class_name('MuiButton-label').click()  # Click login button
            # TODO: Check that we can see our specific todos
            # WebDriverWait(self.driver, 30).until(EC.url_contains('todos'))  # Wait until URL contains todos
            # self.driver.find_element_by_class_name('MuiTable-root')  # Let's see a table of todos

        except NoSuchElementException as ex:
            print("test_log_in_to_app_usr1 - NoSuchElementException. Selenium sees:")
            print(self.driver.page_source)
            self.fail(ex.msg)


if __name__ == '__main__':
    unittest.main()
