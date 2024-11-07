// Variable declarations
let total_income = 0;
let monthly_income = 0; // Add monthly_income variable
let expense = 0;
const retirementFields = ['pension_insurance', 'pvd', 'rmf', 'nsf', 'ssf'];
let incomeTypeCheckboxes = null;
let remaining_retirement_allowance = 0; // Global variable
let isTaxCalculated = false; // Global variable to track if tax has been calculated

// Function to start the calculator
function startCalculator() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
    setActiveStep(1); // Add this line to set the first step as active
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to format numbers with commas
function formatNumber(num) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

// Function to parse numbers from strings with commas
function parseNumber(str) {
    if (typeof str === 'string') {
        return parseFloat(str.replace(/,/g, '')) || 0;
    }
    return 0;
}

// Function to move to the previous step
function prevStep(currentStep) {
    if (currentStep > 1) {
        // Move to the previous step
        const previousStep = currentStep - 1;
        setActiveStep(previousStep);
        showStep(previousStep);
    }
}

// Function to add comma formatting to input fields
function addCommaEvent(id) {
    let input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', function (e) {
            let cursorPosition = this.selectionStart;
            let value = this.value.replace(/,/g, '');
            if (value === '') {
                this.value = '';
                return;
            }
            if (!isNaN(value)) {
                let parts = value.split('.');
                let integerPart = parts[0];
                let decimalPart = parts[1];

                let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                let formattedValue = formattedInteger;
                if (decimalPart !== undefined) {
                    formattedValue += '.' + decimalPart;
                }
                this.value = formattedValue;
                let diff = this.value.length - value.length;
                this.selectionEnd = cursorPosition + diff;
            } else {
                this.value = this.value.substring(0, cursorPosition - 1) + this.value.substring(cursorPosition);
                this.selectionEnd = cursorPosition - 1;
            }
        });
    }
}

// Function to move to the next step
function nextStep(currentStep) {
    if (validateStep(currentStep)) {
        if (currentStep === 1) {
            // Perform calculations and updates specific to step 1

            // Get income type
            let incomeType = '';
            incomeTypeCheckboxes.forEach(function (checkbox) {
                if (checkbox.checked) {
                    incomeType = checkbox.value;
                }
            });

            // Get income data
            if (incomeType === 'annual') {
                let annual_income = parseNumber(document.getElementById('annual_income').value);
                total_income = annual_income;
                monthly_income = annual_income / 12; // Calculate monthly income
            } else if (incomeType === 'monthly') {
                let monthly_income_input = parseNumber(document.getElementById('monthly_income').value);
                let bonus_income = parseNumber(document.getElementById('bonus_income').value) || 0;
                monthly_income = monthly_income_input; // Set monthly income
                total_income = (monthly_income * 12) + bonus_income;
            }

            // Get other income if checkbox is checked
            let other_income = 0;
            if (document.getElementById('has_other_income').checked) {
                other_income = parseNumber(document.getElementById('other_income').value) || 0;
            }
            total_income += other_income;

            // Calculate expense (50% but not more than 100,000 THB)
            expense = total_income * 0.50;
            if (expense > 100000) expense = 100000;

            // Display expense
            document.getElementById('expense_display').innerText = formatNumber(expense);

            // Update stepper to step 2
            setActiveStep(2);

            // Go to step 2
            showStep(2);
        } else if (currentStep === 2) {
            // Go to step 3
            setActiveStep(3);
            showStep(3);
        }
    }
}

// Function to calculate Social Security contribution
function calculateSocialSecurity() {
    let social_security = 0;
    if (document.getElementById('has_social_security').checked) {
        // Calculate as 5% of monthly income, max 750 baht per month
        let monthly_contribution = monthly_income * 0.05;
        monthly_contribution = Math.min(monthly_contribution, 750);
        social_security = monthly_contribution * 12; // Annual contribution
        social_security = Math.min(social_security, 9000); // Max 9,000 baht per year
        // Display the calculated value
        document.getElementById('social_security').value = formatNumber(social_security);
    } else {
        document.getElementById('social_security').value = '';
    }
}

// Modify the window.onload function to add event listener
window.onload = function () {
    // Initialize incomeTypeCheckboxes
    incomeTypeCheckboxes = document.querySelectorAll('input[name="income_type"]');

    // Attach event listeners to number fields
    let numberFields = [
        'annual_income', 'monthly_income', 'bonus_income', 'other_income',
        // Remove 'social_security' from here since it's auto-calculated
        'life_insurance', 'health_insurance', 'parent_health_insurance', 'pension_insurance',
        'ssf', 'rmf', 'pvd', 'thaiesg', 'social_enterprise', 'nsf',
        'home_loan_interest', 'donation', 'donation_education', 'donation_political',
        'easy_ereceipt', 'local_travel', 'new_home'
    ];

    numberFields.forEach(function (id) {
        addCommaEvent(id);
        let input = document.getElementById(id);
        if (input) {
            input.addEventListener('focus', function () {
                if (this.value === '0') {
                    this.value = '';
                }
            });
            input.addEventListener('blur', function () {
                if (this.value === '') {
                    this.value = '0';
                }
            });
        }
    });

    // Handling income type selection
    incomeTypeCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            incomeTypeCheckboxes.forEach(function (box) {
                if (box !== this) {
                    box.checked = false;
                }
            }, this);

            // Hide both income sections first
            document.getElementById('annual_income_section').style.display = 'none';
            document.getElementById('monthly_income_section').style.display = 'none';

            if (this.value === 'annual' && this.checked) {
                document.getElementById('annual_income_section').style.display = 'block';
            } else if (this.value === 'monthly' && this.checked) {
                document.getElementById('monthly_income_section').style.display = 'block';
            }
        });
    });

    // Event listener for "Other Income" checkbox
    document.getElementById('has_other_income').addEventListener('change', function () {
        document.getElementById('other_income_section').style.display = this.checked ? 'block' : 'none';
    });

    // Event listener for "Do you contribute to Social Security?" checkbox
    document.getElementById('has_social_security').addEventListener('change', function () {
        if (this.checked) {
            document.getElementById('social_security_section').style.display = 'block';
            calculateSocialSecurity(); // Calculate and display Social Security contribution
        } else {
            document.getElementById('social_security_section').style.display = 'none';
            document.getElementById('social_security').value = '';
        }
    });

    // Recalculate Social Security when income changes
    document.getElementById('monthly_income').addEventListener('input', function () {
        let incomeType = document.querySelector('input[name="income_type"]:checked').value;
        if (incomeType === 'monthly') {
            monthly_income = parseNumber(this.value) || 0;
            calculateSocialSecurity();
        }
    });

    document.getElementById('annual_income').addEventListener('input', function () {
        let incomeType = document.querySelector('input[name="income_type"]:checked').value;
        if (incomeType === 'annual') {
            let annual_income = parseNumber(this.value) || 0;
            monthly_income = annual_income / 12;
            calculateSocialSecurity();
        }
    });

    // Populate children options
    populateChildrenOptions();

    // Event listeners for additional deduction sections
    document.getElementById('has_insurance').addEventListener('change', function () {
        document.getElementById('insurance_section').style.display = this.checked ? 'block' : 'none';
        updateRetirementDeductions();
    });
    document.getElementById('has_donation').addEventListener('change', function () {
        document.getElementById('donation_section').style.display = this.checked ? 'block' : 'none';
    });
    document.getElementById('has_stimulus').addEventListener('change', function () {
        document.getElementById('stimulus_section').style.display = this.checked ? 'block' : 'none';
    });

    // Event listeners for retirement deduction fields
    retirementFields.forEach(function (field) {
        let elem = document.getElementById(field);
        if (elem) {
            elem.addEventListener('input', updateRetirementDeductions);
        }
    });

    // Event listeners for stepper steps
    const stepperSteps = document.querySelectorAll('.stepper .stepper-step');
    stepperSteps.forEach(function (step) {
        step.addEventListener('click', function () {
            const targetStep = parseInt(this.getAttribute('data-step'));

            // Get current step (the active step)
            const currentStepElement = document.querySelector('.stepper .stepper-step.active');
            const currentStep = parseInt(currentStepElement.getAttribute('data-step'));

            if (currentStep === 1 && targetStep !== 1) {
                // User is on Step 1 and trying to navigate to another step
                if (validateStep(1)) {
                    // Validation passed, navigate to target step
                    navigateToStep(targetStep);
                } else {
                    // Validation failed, do not navigate
                    // The validateStep function already displays validation messages
                }
            } else if (!isTaxCalculated && targetStep === 4) {
                // Prevent navigation to Step 4 before tax is calculated
                alert('กรุณาคลิกปุ่ม "คำนวณภาษี" เพื่อดูผลการคำนวณ');
            } else {
                // Allow navigation
                navigateToStep(targetStep);
            }
        });
    });
};

// Function to validate a specific step
function validateStep(stepNumber) {
    if (stepNumber === 1) {
        // Perform validation for step 1

        // Check if income type is selected
        let incomeTypeSelected = false;
        let incomeType = '';
        incomeTypeCheckboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                incomeTypeSelected = true;
                incomeType = checkbox.value;
            }
        });

        if (!incomeTypeSelected) {
            document.getElementById('income_type_error').innerText = 'กรุณาเลือกประเภทของรายได้';
            return false;
        } else {
            document.getElementById('income_type_error').innerText = '';
        }

        // Get income data
        if (incomeType === 'annual') {
            let annual_income = parseNumber(document.getElementById('annual_income').value);
            if (annual_income === 0) {
                document.getElementById('annual_income_error').innerText = 'กรุณากรอกรายได้ทั้งปีของคุณ';
                return false;
            } else {
                document.getElementById('annual_income_error').innerText = '';
            }
        } else if (incomeType === 'monthly') {
            let monthly_income_input = parseNumber(document.getElementById('monthly_income').value);
            if (monthly_income_input === 0) {
                document.getElementById('monthly_income_error').innerText = 'กรุณากรอกรายได้ต่อเดือนของคุณ';
                return false;
            } else {
                document.getElementById('monthly_income_error').innerText = '';
            }
        }

        // Validation passed
        return true;
    } else {
        // No validation needed for other steps
        return true;
    }
}

// Function to calculate tax
function calculateTax() {
    // Clear previous error messages
    document.querySelectorAll('.error').forEach(function (el) {
        el.innerText = '';
    });

    let errorMessages = [];
    let errorFields = [];

    // Personal deductions
    let personal_allowance = 60000;
    let spouse = document.getElementById('spouse').value;
    let spouse_allowance = (spouse === 'yes') ? 60000 : 0;

    // Legal children
    let children_own = parseInt(document.getElementById('children_own').value) || 0;
    let child_allowance = 0;
    for (let i = 1; i <= children_own; i++) {
        if (i >= 2) {
            child_allowance += 60000;
        } else {
            child_allowance += 30000;
        }
    }

    // Adopted children
    let children_adopted = parseInt(document.getElementById('children_adopted').value) || 0;
    if (children_adopted > 3) children_adopted = 3; // Max 3
    child_allowance += children_adopted * 30000;

    // Parents
    let parents_allowance = 0;

    if (document.getElementById('your_father').checked) {
        parents_allowance += 30000;
    }
    if (document.getElementById('your_mother').checked) {
        parents_allowance += 30000;
    }
    if (document.getElementById('spouse_father').checked) {
        parents_allowance += 30000;
    }
    if (document.getElementById('spouse_mother').checked) {
        parents_allowance += 30000;
    }

    // Max 120,000 THB
    if (parents_allowance > 120000) parents_allowance = 120000;

    // Disabled persons
    let disabled_persons = parseInt(document.getElementById('disabled_persons').value) || 0;
    let disabled_allowance = disabled_persons * 60000;

    // Social security
    let social_security = 0;
    if (document.getElementById('has_social_security').checked) {
        social_security = parseNumber(document.getElementById('social_security').value);
        // No need to validate since it's auto-calculated
    }

    let total_personal_deductions = personal_allowance + spouse_allowance + child_allowance + parents_allowance + disabled_allowance + social_security;

    // Investment deductions
    let total_investment_deductions = 0;

    // Retirement deductions
    let retirement_total = 0;

    let insurance_total = 0;
    let parent_health_insurance = 0;

    if (document.getElementById('has_insurance').checked) {
        let life_insurance = parseNumber(document.getElementById('life_insurance').value);
        if (life_insurance > 100000) {
            errorMessages.push('เบี้ยประกันชีวิตและประกันสะสมทรัพย์ไม่ควรเกิน 100,000 บาท');
            errorFields.push('life_insurance');
        }
        life_insurance = Math.min(life_insurance, 100000);

        let health_insurance = parseNumber(document.getElementById('health_insurance').value);
        if (health_insurance > 25000) {
            errorMessages.push('เบี้ยประกันสุขภาพไม่ควรเกิน 25,000 บาท');
            errorFields.push('health_insurance');
        }
        health_insurance = Math.min(health_insurance, 25000);

        // Total insurance
        insurance_total = life_insurance + health_insurance;
        if (insurance_total > 100000) {
            errorMessages.push('รวมเบี้ยประกันชีวิตและสุขภาพไม่ควรเกิน 100,000 บาท');
            errorFields.push('life_insurance');
        }
        insurance_total = Math.min(insurance_total, 100000);

        parent_health_insurance = parseNumber(document.getElementById('parent_health_insurance').value);
        if (parent_health_insurance > 15000) {
            errorMessages.push('เบี้ยประกันสุขภาพบิดามารดาไม่ควรเกิน 15,000 บาท');
            errorFields.push('parent_health_insurance');
        }
        parent_health_insurance = Math.min(parent_health_insurance, 15000);

        let pension_insurance = parseNumber(document.getElementById('pension_insurance').value);
        if (pension_insurance > 200000) {
            errorMessages.push('เบี้ยประกันชีวิตแบบบำนาญไม่ควรเกิน 200,000 บาท');
            errorFields.push('pension_insurance');
        }
        pension_insurance = Math.min(pension_insurance, 200000);

        let pvd = parseNumber(document.getElementById('pvd').value);
        let pvd_limit = Math.min(total_income * 0.15, 500000);
        if (pvd > pvd_limit) {
            errorMessages.push('เงินสมทบกองทุนสำรองเลี้ยงชีพ (PVD) ไม่ควรเกิน 15% ของรายได้หรือ 500,000 บาท');
            errorFields.push('pvd');
        }
        pvd = Math.min(pvd, pvd_limit);

        let ssf = parseNumber(document.getElementById('ssf').value);
        let ssf_limit = Math.min(total_income * 0.30, 200000);
        if (ssf > ssf_limit) {
            errorMessages.push('กองทุนรวมเพื่อการออม (SSF) ไม่ควรเกิน 30% ของรายได้หรือ 200,000 บาท');
            errorFields.push('ssf');
        }
        ssf = Math.min(ssf, ssf_limit);

        let rmf = parseNumber(document.getElementById('rmf').value);
        let rmf_limit = Math.min(total_income * 0.30, 500000);
        if (rmf > rmf_limit) {
            errorMessages.push('กองทุนรวมเพื่อการเลี้ยงชีพ (RMF) ไม่ควรเกิน 30% ของรายได้หรือ 500,000 บาท');
            errorFields.push('rmf');
        }
        rmf = Math.min(rmf, rmf_limit);

        let thaiesg = parseNumber(document.getElementById('thaiesg').value);
        let thaiesg_limit = Math.min(total_income * 0.30, 300000);
        if (thaiesg > thaiesg_limit) {
            errorMessages.push('กองทุนรวมไทยเพื่อความยั่งยืน (Thai ESG) ไม่ควรเกิน 30% ของรายได้หรือ 300,000 บาท');
            errorFields.push('thaiesg');
        }
        thaiesg = Math.min(thaiesg, thaiesg_limit);

        let social_enterprise = parseNumber(document.getElementById('social_enterprise').value);
        if (social_enterprise > 100000) {
            errorMessages.push('เงินลงทุนธุรกิจ Social Enterprise ไม่ควรเกิน 100,000 บาท');
            errorFields.push('social_enterprise');
        }
        social_enterprise = Math.min(social_enterprise, 100000);

        let nsf = parseNumber(document.getElementById('nsf').value);
        if (nsf > 13200) {
            errorMessages.push('เงินสมทบกองทุนการออมแห่งชาติ (กอช.) ไม่ควรเกิน 13,200 บาท');
            errorFields.push('nsf');
        }
        nsf = Math.min(nsf, 13200);

        // Total retirement deductions (max 500,000 THB)
        retirement_total = pension_insurance + pvd + rmf + nsf + ssf;
        if (retirement_total > 500000) {
            errorMessages.push('รวมค่าลดหย่อนกลุ่มเกษียณไม่ควรเกิน 500,000 บาท');
            errorFields.push('pension_insurance');
        }
        retirement_total = Math.min(retirement_total, 500000);

        total_investment_deductions = insurance_total + parent_health_insurance + retirement_total + thaiesg + social_enterprise;
    }

    // Donation deductions
    let total_donation_deductions = 0;
    if (document.getElementById('has_donation').checked) {
        let donation = parseNumber(document.getElementById('donation').value);

        let donation_education = parseNumber(document.getElementById('donation_education').value) * 2;

        let donation_political = parseNumber(document.getElementById('donation_political').value);
        if (donation_political > 10000) {
            errorMessages.push('เงินบริจาคพรรคการเมืองไม่ควรเกิน 10,000 บาท');
            errorFields.push('donation_political');
        }
        donation_political = Math.min(donation_political, 10000);

        total_donation_deductions = donation + donation_education + donation_political;
    }

    // Stimulus deductions
    let total_stimulus_deductions = 0;
    if (document.getElementById('has_stimulus').checked) {
        let easy_ereceipt = parseNumber(document.getElementById('easy_ereceipt').value);
        if (easy_ereceipt > 50000) {
            errorMessages.push('ช้อปดีมีคืน 2567 ไม่ควรเกิน 50,000 บาท');
            errorFields.push('easy_ereceipt');
        }
        easy_ereceipt = Math.min(easy_ereceipt, 50000);

        let local_travel = parseNumber(document.getElementById('local_travel').value);
        if (local_travel > 15000) {
            errorMessages.push('ค่าลดหย่อนเที่ยวเมืองรอง 2567 ไม่ควรเกิน 15,000 บาท');
            errorFields.push('local_travel');
        }
        local_travel = Math.min(local_travel, 15000);

        let home_loan_interest = parseNumber(document.getElementById('home_loan_interest').value);
        if (home_loan_interest > 100000) {
            errorMessages.push('ดอกเบี้ยกู้ยืมเพื่อที่อยู่อาศัยไม่ควรเกิน 100,000 บาท');
            errorFields.push('home_loan_interest');
        }
        home_loan_interest = Math.min(home_loan_interest, 100000);

        let new_home = parseNumber(document.getElementById('new_home').value);
        let new_home_deduction = Math.floor(new_home / 1000000) * 10000;
        if (new_home_deduction > 100000) {
            errorMessages.push('ค่าสร้างบ้านใหม่ 2567-2568 ไม่ควรเกิน 100,000 บาท');
            errorFields.push('new_home');
        }
        new_home_deduction = Math.min(new_home_deduction, 100000);

        total_stimulus_deductions = easy_ereceipt + local_travel + home_loan_interest + new_home_deduction;
    }

    // If there are errors, show the error modal
    if (errorMessages.length > 0) {
        showErrorModal(errorMessages, errorFields);
        return;
    }

    // Total deductions
    let total_deductions = expense + total_personal_deductions + total_investment_deductions + total_stimulus_deductions;

    // Taxable income after preliminary deductions
    let taxable_income = total_income - total_deductions;
    if (taxable_income < 0) taxable_income = 0;

    // Calculate donation deduction (max 10% of taxable income)
    if (document.getElementById('has_donation').checked) {
        let donation_limit = taxable_income * 0.10;
        if (total_donation_deductions > donation_limit) {
            total_donation_deductions = donation_limit;
        }
    }

    total_deductions += total_donation_deductions;

    // Net income
    let net_income = total_income - total_deductions;
    if (net_income < 0) net_income = 0;

    // Tax calculation
    let tax = 0;
    if (net_income <= 150000) {
        tax = 0;
    } else if (net_income <= 300000) {
        tax = (net_income - 150000) * 0.05;
    } else if (net_income <= 500000) {
        tax = ((net_income - 300000) * 0.10) + 7500;
    } else if (net_income <= 750000) {
        tax = ((net_income - 500000) * 0.15) + 27500;
    } else if (net_income <= 1000000) {
        tax = ((net_income - 750000) * 0.20) + 65000;
    } else if (net_income <= 2000000) {
        tax = ((net_income - 1000000) * 0.25) + 115000;
    } else if (net_income <= 5000000) {
        tax = ((net_income - 2000000) * 0.30) + 365000;
    } else {
        tax = ((net_income - 5000000) * 0.35) + 1265000;
    }

    // Effective tax rate
    let effective_tax_rate = 0;
    if (total_income > 0) {
        effective_tax_rate = (tax / total_income) * 100;
    }

    // Recommended investment amounts
    // Calculate maximum limits based on income
    let ssf_limit = Math.min(total_income * 0.30, 200000); // SSF: 30% of income, max 200,000
    let rmf_limit = Math.min(total_income * 0.30, 500000); // RMF: 30% of income, max 500,000
    let retirement_total_limit = 500000; // Total retirement deductions limit

    // Current investments
    let current_ssf = parseNumber(document.getElementById('ssf').value) || 0;
    let current_rmf = parseNumber(document.getElementById('rmf').value) || 0;
    let current_pvd = parseNumber(document.getElementById('pvd').value) || 0;
    let current_pension_insurance = parseNumber(document.getElementById('pension_insurance').value) || 0;
    let current_nsf = parseNumber(document.getElementById('nsf').value) || 0;

    // Total retirement contributions
    let total_retirement_contributions = current_ssf + current_rmf + current_pvd + current_pension_insurance + current_nsf;

    // Remaining retirement allowance
    remaining_retirement_allowance = retirement_total_limit - total_retirement_contributions;
    remaining_retirement_allowance = Math.max(0, remaining_retirement_allowance);

    // Remaining individual limits for SSF and RMF
    let remaining_ssf_limit = ssf_limit - current_ssf;
    remaining_ssf_limit = Math.max(0, remaining_ssf_limit);

    let remaining_rmf_limit = rmf_limit - current_rmf;
    remaining_rmf_limit = Math.max(0, remaining_rmf_limit);

    // Recommended SSF and RMF investments
    let recommended_ssf = Math.min(remaining_ssf_limit, remaining_retirement_allowance);
    let recommended_rmf = Math.min(remaining_rmf_limit, remaining_retirement_allowance);

    // Calculate recommended_thaiesg
    let thaiesg_limit = Math.min(total_income * 0.30, 300000);
    let current_thaiesg = parseNumber(document.getElementById('thaiesg').value) || 0;
    let recommended_thaiesg = Math.max(0, Math.min(thaiesg_limit - current_thaiesg, total_income * 0.30 - current_thaiesg));

    // Display results
    document.getElementById('result_total_income').innerText = formatNumber(total_income);
    document.getElementById('result_expense').innerText = formatNumber(expense);
    document.getElementById('result_deductions').innerText = formatNumber(total_deductions - expense);
    document.getElementById('result_net_income').innerText = formatNumber(net_income);
    document.getElementById('result_tax').innerText = formatNumber(tax) + ' บาท';
    document.getElementById('result_effective_tax_rate').innerText = effective_tax_rate.toFixed(2) + '%';

    // Update recommended investments display
    updateInvestmentDisplay('max_ssf', recommended_ssf);
    updateInvestmentDisplay('max_rmf', recommended_rmf);
    updateInvestmentDisplay('max_thaiesg', recommended_thaiesg);

    // Set isTaxCalculated to true
    isTaxCalculated = true;

    // Update stepper to step 4
    setActiveStep(4);

    // Show result section
    showStep(4);
}

// Function to update retirement deductions in real-time
function updateRetirementDeductions() {
    let ssf = parseNumber(document.getElementById('ssf').value) || 0;
    let rmf = parseNumber(document.getElementById('rmf').value) || 0;
    let pvd = parseNumber(document.getElementById('pvd').value) || 0;
    let pension_insurance = parseNumber(document.getElementById('pension_insurance').value) || 0;
    let nsf = parseNumber(document.getElementById('nsf').value) || 0;

    let total_retirement_contributions = ssf + rmf + pvd + pension_insurance + nsf;

    let retirement_total_limit = 500000;
    remaining_retirement_allowance = retirement_total_limit - total_retirement_contributions;
    remaining_retirement_allowance = Math.max(0, remaining_retirement_allowance);

    let ssf_limit = Math.min(total_income * 0.30, 200000);
    let rmf_limit = Math.min(total_income * 0.30, 500000);

    let remaining_ssf_limit = ssf_limit - ssf;
    remaining_ssf_limit = Math.max(0, remaining_ssf_limit);

    let remaining_rmf_limit = rmf_limit - rmf;
    remaining_rmf_limit = Math.max(0, remaining_rmf_limit);

    // Recommended SSF and RMF investments
    let recommended_ssf = Math.min(remaining_ssf_limit, remaining_retirement_allowance);
    let recommended_rmf = Math.min(remaining_rmf_limit, remaining_retirement_allowance);

    // Calculate recommended_thaiesg
    let thaiesg = parseNumber(document.getElementById('thaiesg').value) || 0;
    let thaiesg_limit = Math.min(total_income * 0.30, 300000);
    let recommended_thaiesg = Math.max(0, Math.min(thaiesg_limit - thaiesg, total_income * 0.30 - thaiesg));

    // Update the display with conditional formatting
    updateInvestmentDisplay('max_ssf', recommended_ssf);
    updateInvestmentDisplay('max_rmf', recommended_rmf);
    updateInvestmentDisplay('max_thaiesg', recommended_thaiesg);
}

// Function to show error modal
function showErrorModal(messages, fields) {
    const errorModal = document.getElementById('errorModal');
    const errorList = document.getElementById('errorList');
    errorList.innerHTML = '';
    messages.forEach(function (msg) {
        const li = document.createElement('li');
        li.innerText = msg;
        errorList.appendChild(li);
    });
    errorModal.style.display = 'block';

    // Store error fields
    errorModal.errorFields = fields;
}

// Function to close error modal
function closeErrorModal() {
    const errorModal = document.getElementById('errorModal');
    errorModal.style.display = 'none';

    // Scroll to the first error field
    if (errorModal.errorFields && errorModal.errorFields.length > 0) {
        const firstErrorField = document.getElementById(errorModal.errorFields[0]);
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
    }
}

// Function to edit data
function editData() {
    // Return to step 3 to edit data
    navigateToStep(3);
}

// Function to reset data
function resetData() {
    // Reload the page to reset all data
    location.reload();
}

// Function to go to investment section
function goToInvestmentSection() {
    // Navigate to step 3 and scroll to the investment section
    navigateToStep(3);

    // Ensure the insurance section is displayed
    if (!document.getElementById('has_insurance').checked) {
        document.getElementById('has_insurance').checked = true;
        document.getElementById('insurance_section').style.display = 'block';
    }

    // Scroll to the SSF field
    const ssfField = document.getElementById('ssf');
    if (ssfField) {
        ssfField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ssfField.focus();
    }
}

// Function to update investment display
function updateInvestmentDisplay(elementId, amount) {
    const element = document.getElementById(elementId);
    if (elementId === 'max_ssf' || elementId === 'max_rmf') {
        if (amount <= 0) {
            element.innerText = 'ไม่สามารถซื้อเพิ่มได้';
            element.style.color = 'red';
        } else {
            element.innerText = formatNumber(amount) + ' บาท ';
            element.style.color = 'green';
        }
    } else if (elementId === 'max_thaiesg') {
        if (amount <= 0) {
            element.innerText = 'ไม่สามารถซื้อเพิ่มได้';
            element.style.color = 'red';
        } else {
            element.innerText = formatNumber(amount) + ' บาท';
            element.style.color = 'green';
        }
    }
}

// Function to set active step in stepper
function setActiveStep(stepNumber) {
    const stepper = document.getElementById('stepper');
    stepper.setAttribute('data-current-step', stepNumber);

    const stepperSteps = document.querySelectorAll('.stepper .stepper-step');
    stepperSteps.forEach(function (step) {
        const stepDataNumber = parseInt(step.getAttribute('data-step'));
        if (stepDataNumber < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepDataNumber === stepNumber) {
            step.classList.add('active');
            step.classList.add('completed');
        } else {
            step.classList.remove('active');
            step.classList.remove('completed');
        }
    });
}

// Function to navigate to a specific step
function navigateToStep(stepNumber) {
    // Hide all step contents
    document.querySelectorAll('.container .step-content').forEach(function (step) {
        step.classList.remove('active');
        step.style.display = 'none';
    });

    // Show the selected step content
    document.getElementById(`step-${stepNumber}`).style.display = 'block';
    document.getElementById(`step-${stepNumber}`).classList.add('active');

    // Update stepper active state
    setActiveStep(stepNumber);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to show a specific step
function showStep(stepNumber) {
    navigateToStep(stepNumber);
}

// Function to populate children options
function populateChildrenOptions() {
    const childrenOwnSelect = document.getElementById('children_own');
    const childrenAdoptedSelect = document.getElementById('children_adopted');
    const disabledPersonsSelect = document.getElementById('disabled_persons');
    for (let i = 0; i <= 10; i++) {
        const optionOwn = document.createElement('option');
        optionOwn.value = i;
        optionOwn.text = i;
        if (i === 0) {
            optionOwn.selected = true;
        }
        if (childrenOwnSelect) {
            childrenOwnSelect.add(optionOwn);
        }

        const optionAdopted = document.createElement('option');
        optionAdopted.value = i;
        optionAdopted.text = i;
        if (i === 0) {
            optionAdopted.selected = true;
        }
        if (childrenAdoptedSelect) {
            childrenAdoptedSelect.add(optionAdopted);
        }

        const optionDisabled = document.createElement('option');
        optionDisabled.value = i;
        optionDisabled.text = i;
        if (i === 0) {
            optionDisabled.selected = true;
        }
        if (disabledPersonsSelect) {
            disabledPersonsSelect.add(optionDisabled);
        }
    }
}
