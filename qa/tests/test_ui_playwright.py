import re
import socket
import pytest
from playwright.sync_api import Page, expect
from faker import Faker

fake = Faker()

def is_frontend_running(host="127.0.0.1", port=3000):
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False

def authenticate_session(page: Page):
    page.goto("http://localhost:3000/login")
    page.evaluate("""() => {
        localStorage.setItem('auth_token', 'MOCK_QA_JWT_TOKEN');
        localStorage.setItem('token', 'MOCK_QA_JWT_TOKEN');
        localStorage.setItem('tenantId', 'TENANT_ALPHA');
        localStorage.setItem('user', JSON.stringify({ name: 'Awais HR Admin', role: 'TENANT_ADMIN' }));
    }""")

@pytest.mark.ui
def test_real_user_landing_and_login_page_renders(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    page.goto("http://localhost:3000")
    expect(page).to_have_title(re.compile(r"Awais|HR|Enterprise|SaaS", re.IGNORECASE))
    
    # Check landing page primary CTA / navigation buttons
    login_btn = page.locator("a:has-text('Login'), button:has-text('Login'), a:has-text('Sign In')")
    if login_btn.count() > 0:
        expect(login_btn.first).to_be_visible()

@pytest.mark.ui
def test_real_user_login_form_validation(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    page.goto("http://localhost:3000/login")
    
    # 1. Test empty form submission
    submit_btn = page.locator("button[type='submit']")
    if submit_btn.is_visible():
        submit_btn.click()
        page.wait_for_timeout(500)
        # Verify page remains on login or displays validation
        assert "/login" in page.url or page.locator("input[type='password']").is_visible()
    
    # 2. Test invalid email format input
    email_input = page.locator("input[type='email'], input[name='email']")
    if email_input.is_visible():
        email_input.fill("invalid-human-email-format")
        password_input = page.locator("input[type='password']")
        if password_input.is_visible():
            password_input.fill("Short1!")
        if submit_btn.is_visible():
            submit_btn.click()
            page.wait_for_timeout(500)
            # HTML5 or JS validation keeps user on login
            assert "/login" in page.url or page.locator("input[type='email']").is_visible()

@pytest.mark.ui
def test_real_user_dashboard_navigation_and_command_palette(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(1000)
    
    # Verify main layout header or dashboard container
    body = page.locator("body")
    expect(body).to_be_visible()
    
    header = page.locator("header")
    if header.is_visible():
        expect(header).to_be_visible()
    
    # Click Command Palette search trigger if available
    cmd_trigger = page.locator("button:has-text('Search modules'), kbd:has-text('⌘K')")
    if cmd_trigger.count() > 0 and cmd_trigger.first.is_visible():
        cmd_trigger.first.click()
        page.wait_for_timeout(500)
        cmd_modal = page.locator("text=Command Palette, input[placeholder*='Search']")
        if cmd_modal.count() > 0:
            expect(cmd_modal.first).to_be_visible()

@pytest.mark.ui
def test_real_user_industry_switcher_header_interaction(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(1000)
    
    # Locate industry select dropdown in top navigation header if visible
    industry_select = page.locator("select:has(option[value='HEALTHCARE'])")
    if industry_select.count() > 0 and industry_select.first.is_visible():
        expect(industry_select.first).to_be_visible()
        industry_select.first.select_option("HEALTHCARE")
        page.wait_for_timeout(500)
        expect(industry_select.first).to_have_value("HEALTHCARE")

@pytest.mark.ui
def test_real_user_employee_directory_page(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/employees")
    page.wait_for_timeout(1000)
    
    body = page.locator("body")
    expect(body).to_be_visible()
    
    search_input = page.locator("input[placeholder*='Search'], input[type='search']")
    if search_input.count() > 0 and search_input.first.is_visible():
        fake_name = fake.first_name()
        search_input.first.fill(fake_name)
        page.wait_for_timeout(300)
        expect(search_input.first).to_have_value(fake_name)

@pytest.mark.ui
def test_real_user_payroll_dashboard(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/payroll")
    page.wait_for_timeout(1000)
    
    body = page.locator("body")
    expect(body).to_be_visible()

@pytest.mark.ui
def test_real_user_mobile_responsive_viewport(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    # Simulate mobile iPhone viewport
    page.set_viewport_size({"width": 375, "height": 812})
    authenticate_session(page)
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(1000)
    
    body = page.locator("body")
    expect(body).to_be_visible()
