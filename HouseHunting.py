portion_down_payment = 0.25
current_savings = 0
r = .04
months = 0
#additional = current_savings*r/12
annual_salary = float(input("What is your annual salary?"))
portion_saved = float(input("What portion of your salary would you like to save? (decimal)"))
total_cost = float(input("What is the cost of your dream home?"))
down_payment = total_cost*portion_down_payment
monthly_savings = (annual_salary*portion_saved)/12
while current_savings <= down_payment:
    months += 1
    current_savings += monthly_savings
    additional = current_savings*(r/12)
    current_savings = current_savings + additional
    
    
    
    
print("Enter your annual salary: ", annual_salary)
print("Enter the percent of your salary to save, as a decimal: ", portion_saved)
print("Enter the cost of your dream home:", total_cost)
print("Number of months: ", months)
