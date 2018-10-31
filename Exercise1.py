book_price = 24.95
wholesale_discount = .4
disount_price = book_price - (book_price*wholesale_discount)
shipping_initial = 3
shipping_additional = .75
num_of_books = 60

total_cost = (discount_price * num_of_books) + shipping_initial + (shipping_additional * (num_of_books -1))
print(total_cost)
