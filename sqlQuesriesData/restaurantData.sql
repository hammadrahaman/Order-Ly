INSERT INTO "Restaurant" (
  id, name, city, "gstPercentage", "subscriptionStatus", "trialEndsAt"
) VALUES
('r-1','Al Madina Cafe','Hyderabad',5,'ACTIVE',NOW()+INTERVAL '30 days'),
('r-2','Royal Biryani','Bangalore',5,'ACTIVE',NOW()+INTERVAL '30 days'),
('r-3','Tea Junction','Mumbai',5,'ACTIVE',NOW()+INTERVAL '30 days');



INSERT INTO "User" (
  id, "restaurantId", name, email, password, role
) VALUES
('u-1','r-1','Owner Madina','madina@test.com',
'$2b$10$wH8JmM3H5d0l0QzE9x5c9O9G7l9C3vNnM6qJr3z7sYQxkT5z9A1gC','OWNER'),

('u-2','r-2','Owner Royal','royal@test.com',
'$2b$10$wH8JmM3H5d0l0QzE9x5c9O9G7l9C3vNnM6qJr3z7sYQxkT5z9A1gC','OWNER'),

('u-3','r-3','Owner Tea','tea@test.com',
'$2b$10$wH8JmM3H5d0l0QzE9x5c9O9G7l9C3vNnM6qJr3z7sYQxkT5z9A1gC','OWNER');



INSERT INTO "MenuCategory" (id, "restaurantId", name) VALUES
-- R1
('c1-r1','r-1','Beverages'),
('c2-r1','r-1','Snacks'),
('c3-r1','r-1','Meals'),
('c4-r1','r-1','Desserts'),
('c5-r1','r-1','Fast Food'),

-- R2
('c1-r2','r-2','Biryani'),
('c2-r2','r-2','Starters'),
('c3-r2','r-2','Curries'),
('c4-r2','r-2','Breads'),
('c5-r2','r-2','Desserts'),

-- R3
('c1-r3','r-3','Tea'),
('c2-r3','r-3','Coffee'),
('c3-r3','r-3','Snacks'),
('c4-r3','r-3','Specials'),
('c5-r3','r-3','Combos');





INSERT INTO "MenuItem" (
  id, "restaurantId", "categoryId", name, code, price, "isVeg"
) VALUES
-- Beverages
('i1','r-1','c1-r1','Sweet Lassi','1',40,true),
('i2','r-1','c1-r1','Salt Lassi','2',35,true),
('i3','r-1','c1-r1','Tea','3',15,true),
('i4','r-1','c1-r1','Coffee','4',20,true),
('i5','r-1','c1-r1','Buttermilk','5',25,true),

-- Snacks
('i6','r-1','c2-r1','Samosa','6',20,true),
('i7','r-1','c2-r1','Veg Puff','7',25,true),
('i8','r-1','c2-r1','Cutlet','8',30,true),
('i9','r-1','c2-r1','Pakoda','9',25,true),
('i10','r-1','c2-r1','French Fries','10',50,true),

-- Meals
('i11','r-1','c3-r1','Veg Thali','11',120,true),
('i12','r-1','c3-r1','Chicken Thali','12',180,false),
('i13','r-1','c3-r1','Rice Plate','13',80,true),
('i14','r-1','c3-r1','Dal Rice','14',90,true),
('i15','r-1','c3-r1','Curd Rice','15',85,true),

-- Desserts
('i16','r-1','c4-r1','Gulab Jamun','16',40,true),
('i17','r-1','c4-r1','Ice Cream','17',50,true),
('i18','r-1','c4-r1','Kheer','18',45,true),
('i19','r-1','c4-r1','Halwa','19',40,true),
('i20','r-1','c4-r1','Brownie','20',60,true),

-- Fast Food
('i21','r-1','c5-r1','Veg Burger','21',70,true),
('i22','r-1','c5-r1','Chicken Burger','22',90,false),
('i23','r-1','c5-r1','Veg Pizza','23',120,true),
('i24','r-1','c5-r1','Chicken Pizza','24',150,false),
('i25','r-1','c5-r1','Sandwich','25',60,true);


INSERT INTO "MenuItem" (
  id, "restaurantId", "categoryId", name, code, price, "isVeg"
) VALUES
('i26','r-2','c1-r2','Chicken Biryani','1',220,false),
('i27','r-2','c1-r2','Mutton Biryani','2',280,false),
('i28','r-2','c1-r2','Veg Biryani','3',180,true),
('i29','r-2','c1-r2','Egg Biryani','4',200,false),
('i30','r-2','c1-r2','Paneer Biryani','5',210,true);
