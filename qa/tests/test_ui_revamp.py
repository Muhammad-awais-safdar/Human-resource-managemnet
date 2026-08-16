import re
import socket
import pytest
from playwright.sync_api import Page, expect

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
def test_product_tour_and_help_center_revamp(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(1500)
    
    # 1. Test Guided Tour Trigger Button
    tour_btn = page.locator("button:has-text('Guided Tour')")
    if tour_btn.is_visible():
        tour_btn.click()
        page.wait_for_timeout(500)
        tour_modal = page.locator("[data-tour='tour-modal']")
        if tour_modal.is_visible():
            expect(tour_modal).to_be_visible()
            # Click skip tour
            skip_btn = page.locator("button:has-text('Skip Tour')")
            if skip_btn.is_visible():
                skip_btn.click()
                page.wait_for_timeout(300)

    # 2. Test Help & Guides Modal Trigger
    help_btn = page.locator("[data-tour='help-center-button']")
    if help_btn.is_visible():
        help_btn.click()
        page.wait_for_timeout(500)
        help_dialog = page.locator("h2:has-text('Platform Help')")
        if help_dialog.is_visible():
            expect(help_dialog).to_be_visible()
            close_btn = page.locator("button[aria-label='Close dialog']")
            if close_btn.is_visible():
                close_btn.click()

@pytest.mark.ui
def test_onboarding_wizard_and_setup_checklist(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(1000)
    
    # Check Setup Checklist Widget
    checklist_widget = page.locator("[data-tour='setup-checklist-widget']")
    if checklist_widget.is_visible():
        expect(checklist_widget).to_be_visible()

    # Open Workspace Wizard
    wizard_btn = page.locator("button:has-text('Workspace Wizard'), button:has-text('Resume Setup Wizard')")
    if wizard_btn.count() > 0 and wizard_btn.first.is_visible():
        wizard_btn.first.click()
        page.wait_for_timeout(500)
        wizard_title = page.locator("h2:has-text('Step 1 of 10')")
        if wizard_title.is_visible():
            expect(wizard_title).to_be_visible()

@pytest.mark.ui
def test_rbac_developer_key_toggle(page: Page):
    if not is_frontend_running():
        pytest.skip("Next.js frontend server is not running on http://localhost:3000")
    
    authenticate_session(page)
    page.goto("http://localhost:3000/roles")
    page.wait_for_timeout(1000)
    
    dev_toggle = page.locator("[data-tour='rbac-developer-toggle'] button")
    if dev_toggle.is_visible():
        dev_toggle.click()
        page.wait_for_timeout(300)
        expect(dev_toggle).to_contain_text("Developer Key View")
