
-- Xoá dữ liệu cũ
DELETE FROM reviews;
DELETE FROM products;

-- Nạp 100 sản phẩm mới
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p01', 'Áo Thun Cổ Tròn Big Size Navy1805', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 270000, 80, 'https://cdn.hstatic.net/products/1000402464/ts26ss19g-rg_navy__1__a80c1c0d07d040f7a880f41f1eb12656_large.jpg', 5, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p02', 'Áo Thun Cổ Tròn Big Size Navy BS2763', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 300000, 87, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p03', 'Áo Thun Nam Oversize Đen Streetwear', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 330000, 94, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p04', 'T-Shirt Big Size Navy BSX653', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 350000, 101, 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p05', 'Áo Thun Nam Thể Thao Thoáng Khí Pro', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 370000, 108, 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p06', 'Áo Thun Nam Graphic Minimalist Hiện Đại', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 400000, 115, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p07', 'Áo Thun Nam Xám Melange Cổ Tròn', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 420000, 122, 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p08', 'Áo Thun Nam Trắng Dáng Relaxed', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 440000, 129, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p09', 'Áo Thun Nam Cổ Tròn Bo Viền Cao Cấp', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 460000, 136, 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p10', 'Áo Thun Nam Vintage Washed Xám Tro', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 490000, 143, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p11', 'Áo Thun Nam Cổ Tim Phong Cách Casual', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 510000, 150, 'https://images.unsplash.com/photo-1521485714898-f097eb6fc5b9?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p12', 'Áo Thun Nam Street Style In Họa Tiết', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 530000, 157, 'https://images.unsplash.com/photo-1579038773867-044c48829161?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p13', 'Áo Sơ Mi Nam Oxford Dài Tay Trắng', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 560000, 164, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p14', 'Áo Sơ Mi Nam Vải Đũi Linen Mát Mẻ', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 580000, 171, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p15', 'Áo Sơ Mi Nam Slim Fit Công Sở Thanh Lịch', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 600000, 178, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80', 5, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p16', 'Áo Sơ Mi Nam Tay Ngắn Cổ Cuba Retro', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 630000, 185, 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p17', 'Áo Sơ Mi Nam Kẻ Ca-rô Denim Phóng Khoáng', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 650000, 192, 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p18', 'Áo Sơ Mi Nam Xanh Pastel Chống Nhăn', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 670000, 199, 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p19', 'Áo Sơ Mi Nam Flannel Dày Dặn Thu Đông', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 690000, 86, 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p20', 'Áo Sơ Mi Nam Kẻ Sọc Dọc Trẻ Trung', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 720000, 93, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p21', 'Áo Sơ Mi Nam Cổ Tàu Đũi Tự Nhiên', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 740000, 100, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p22', 'Áo Sơ Mi Nam Doanh Nhân Cao Cấp', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 760000, 107, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p23', 'Áo Sơ Mi Nam Lụa Satin Dự Tiệc Tối', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 790000, 114, 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p24', 'Áo Sơ Mi Nam Dệt Họa Tiết Chambray', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-so-mi', 'Maison', 810000, 121, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p25', 'Áo Khoác Da Biker Nam Cá Tính Cực Ngầu Bá Cháyyy', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 830000, 128, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', 4, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p26', 'Áo Khoác Bomber Nam Phối Màu Trẻ Trung', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 860000, 135, 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p27', 'Áo Khoác Nam Có Nón Dù Trượt Nước', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 880000, 142, 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p28', 'Áo Khoác Măng Tô Dạ Nam Dáng Dài Ấm Áp', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 900000, 149, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p29', 'Áo Khoác Jean Nam Trucker Phong Trần', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 920000, 156, 'https://images.unsplash.com/photo-1537109662156-fade15c5ae8e?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p30', 'Áo Blazer Nam May Đo Phong Cách Hàn Quốc', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 950000, 163, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p31', 'Áo Blazer Nam Form Rộng Casual Hiện Đại', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 970000, 170, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p32', 'Áo Khoác Nam Kẻ Glen Plaid Lịch Lãm', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 990000, 177, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p33', 'Áo Vest Nam Doanh Nhân Màu Xám Than', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 1020000, 184, 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p34', 'Áo Khoác Gió Nam Thể Thao Cản Gió Siêu Nhẹ', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 290000, 191, 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p35', 'Áo Khoác Safari Nam Phong Cách Utility', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 310000, 198, 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p36', 'Áo Khoác Dạ Hai Hàng Khuy Cổ Điển', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 340000, 85, 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p37', 'Áo Khoác Da Lộn Nam Màu Nâu Vintage', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-khoac', 'Maison', 360000, 92, 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p38', 'Quần Jean Nam Xanh Classic Dáng Straight', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 380000, 99, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p39', 'Quần Jean Nam Tối Màu Slim Fit Cao Cấp', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 400000, 106, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p40', 'Quần Chino Nam Vải Kaki Co Giãn Màu Be', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 430000, 113, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p41', 'Quần Jean Nam Rách Xước Nhẹ Retro', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 450000, 120, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p42', 'Quần Jogger Nam Thể Thao Bo Gấu Năng Động', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 470000, 127, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p43', 'Quần Jean Nam Vải Raw Selvedge Bền Đẹp', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 500000, 134, 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p44', 'Quần Túi Hộp Cargo Nam Phong Cách Bụi Bặm', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 520000, 141, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p45', 'Quần Tây Nam Xếp Ly Công Sở Lịch Lãm', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 540000, 148, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p46', 'Quần Ống Suông Nam Rộng Thoải Mái', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 570000, 155, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p47', 'Quần Kaki Nam Lửng Cropped Mắt Cá', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 590000, 162, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p48', 'Quần Tây Nam Đen Dáng Slim Doanh Nhân', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 610000, 169, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p49', 'Quần Vải Linen Nam Đũi Suông Thoáng Mát', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 630000, 176, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p50', 'Quần Âu Nam May Đo Cao Cấp', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'quan', 'Maison', 660000, 183, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80', 0, 'Nam');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p51', 'Đầm Midi Nữ Xòe Dáng Dài Thanh Lịch', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 320000, 70, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p52', 'Váy Nữ Hoa Nhí Phong Cách Bohemian', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 350000, 81, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p53', 'Đầm Dạ Hội Nữ Cúp Ngực Quyến Rũ', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 380000, 92, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p54', 'Đầm Đỏ Nữ Dự Tiệc Đính Nơ Sang Trọng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 410000, 103, 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p55', 'Váy Hai Dây Nữ Lụa Satin Quyến Rũ', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 440000, 114, 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p56', 'Đầm Chấm Bi Nữ Cổ Điển Vintage', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 470000, 125, 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p57', 'Đầm Nữ Xòe Chữ A Dự Tiệc Cocktail', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 490000, 136, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p58', 'Váy Trắng Nữ Đi Biển Hở Lưng Mùa Hè', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 520000, 147, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p59', 'Đầm Suông Nữ Lụa Phối Ren Duyên Dáng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 550000, 158, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p60', 'Đầm Maxi Nữ Tầng Xếp Dạo Phố', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 580000, 169, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p61', 'Váy Nữ Vải Đũi Linen Thắt Nơ Lưng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 610000, 80, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p62', 'Đầm Voan Nữ Bồng Bềnh Nữ Tính', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 640000, 91, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p63', 'Đầm Blazer Nữ Thanh Lịch Hiện Đại', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 670000, 102, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p64', 'Váy Ôm Body Nữ Dệt Kim Tôn Dáng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'vay-dam', 'Maison', 700000, 113, 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p65', 'Áo Sơ Mi Nữ Lụa Vàng Sang Trọng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 730000, 124, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p66', 'Áo Sơ Mi Nữ Trắng Công Sở Dáng Chuẩn', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 760000, 135, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p67', 'Áo Blouse Nữ Cổ Chữ V Tinh Tế', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 780000, 146, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p68', 'Áo Sơ Mi Nữ Vải Đũi Cổ Đức Nhẹ Nhàng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 810000, 157, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p69', 'Áo Blouse Nữ Họa Tiết Hoa Nhí', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 840000, 168, 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p70', 'Áo Sơ Mi Nữ Form Rộng Phong Cách Boyfriend', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 870000, 79, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p71', 'Áo Blouse Nữ Phối Nơ Cổ Duyên Dáng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 900000, 90, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p72', 'Áo Sơ Mi Nữ Kẻ Sọc Công Sở Trẻ Trung', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 930000, 101, 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p73', 'Áo Kiểu Nữ Xếp Ly Tay Bồng Nữ Tính', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 960000, 112, 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p74', 'Áo Sơ Mi Nữ Croptop Cá Tính Mùa Hè', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-so-mi', 'Maison', 990000, 123, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p75', 'Áo Thun Nữ Graphic Năng Động Phong Cách', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 1020000, 134, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p76', 'Áo Thun Nữ Neon Phối Màu Nổi Bật', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 1050000, 145, 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p77', 'Áo Thun Nữ Cotton Hữu Cơ Basic Trắng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 1070000, 156, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p78', 'Áo Thun Nữ Cổ Lọ Dệt Kim Mềm Mịn', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 1100000, 167, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p79', 'Áo Thun Nữ Pastel Cổ Tròn Nữ Tính', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 1130000, 78, 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p80', 'Áo Tập Nữ Thể Thao Thoáng Khí Ôm Dáng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 1160000, 89, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p81', 'Áo Thun Nữ Rộng Phong Cách Hàn Quốc', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 340000, 100, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p82', 'Áo Thun Nữ Cổ Tim Bo Gân Nhẹ Nhàng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 370000, 111, 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p83', 'Áo Ba Lỗ Nữ Thun Gân Năng Động', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 400000, 122, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p84', 'Áo Thun Nữ Dài Tay Dệt Kim Mùa Thu', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-thun', 'Maison', 430000, 133, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p85', 'Áo Măng Tô Dạ Nữ Màu Be Dáng Dài', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 460000, 144, 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p86', 'Áo Khoác Phao Nữ Đại Hàn Siêu Nhẹ Siêu Ấm', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 490000, 155, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p87', 'Áo Khoác Jean Nữ Croptop Bụi Bặm', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 510000, 166, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p88', 'Áo Cardigan Nữ Dệt Kim Mềm Dáng Rộng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 540000, 77, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p89', 'Áo Khoác Trench Coat Nữ 2 Hàng Khuy Chuẩn Anh', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 570000, 88, 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p90', 'Áo Khoác Nữ Phối Lông Ấm Áp Mùa Đông', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 600000, 99, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p91', 'Áo Khoác Lông Cừu Nữ Dễ Thương Ấm Áp', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'ao-khoac', 'Maison', 630000, 110, 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p92', 'Áo Khoác Bomber Nữ Phối Rib Thêu Chữ Form Regular', '', 'ao-khoac', 'Maison', 660000, 121, 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p93', 'Quần Tây Nữ Ống Rộng Lưng Cao Tôn Dáng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 690000, 132, 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p94', 'Chân Váy Nữ Xếp Ly Dài Sang Trọng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 720000, 143, 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p95', 'Chân Váy Lụa Satin Nữ Dáng Suông Dài', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 750000, 154, 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p96', 'Chân Váy Nữ Chữ A Dạ Kẻ Caro Trẻ Trung', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 780000, 165, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p97', 'Quần Jean Nữ Ống Đứng Cạp Cao Xanh Sáng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 800000, 76, 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p98', 'Quần Nữ Ống Rộng Vải Linen Thoáng Mát', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 830000, 87, 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p99', 'Quần Jean Skinny Nữ Co Giãn Siêu Hack Chân', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 860000, 98, 'https://images.unsplash.com/photo-1597196526281-fe4861daa915?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p100', 'Quần Tây Nữ Dáng Lửng Thời Thượng', 'Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.', 'quan', 'Maison', 890000, 109, 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=800&auto=format&fit=crop&q=80', 0, 'Nữ');
INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('p101', 'Áo Thun Nam Tshirt Basic USa', 'Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.', 'ao-thun', 'Maison', 350000, 100, 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80', 5, 'Nam');

-- Thêm đánh giá mẫu
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p01', 'Nguyễn Văn An', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '0 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p02', 'Trần Thị Mai', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '3 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p02', 'Lê Hoàng Nam', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '4 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p03', 'Lê Hoàng Nam', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '6 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p03', 'Phạm Quỳnh Chi', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '7 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p03', 'Vũ Đình Trọng', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '8 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p04', 'Phạm Quỳnh Chi', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '9 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p05', 'Vũ Đình Trọng', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '12 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p05', 'Đặng Thuỳ Linh', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '13 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p06', 'Đặng Thuỳ Linh', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '15 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p06', 'Bùi Minh Đức', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '16 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p06', 'Hoàng Kim Ngân', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '17 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p07', 'Bùi Minh Đức', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '18 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p08', 'Hoàng Kim Ngân', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '21 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p08', 'Nguyễn Văn An', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '22 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p09', 'Nguyễn Văn An', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '24 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p09', 'Trần Thị Mai', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '25 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p09', 'Lê Hoàng Nam', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '26 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p10', 'Trần Thị Mai', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '27 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p11', 'Lê Hoàng Nam', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '30 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p11', 'Phạm Quỳnh Chi', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '31 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p12', 'Phạm Quỳnh Chi', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '33 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p12', 'Vũ Đình Trọng', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '34 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p12', 'Đặng Thuỳ Linh', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '35 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p13', 'Vũ Đình Trọng', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '36 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p14', 'Đặng Thuỳ Linh', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '39 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p14', 'Bùi Minh Đức', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '40 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p15', 'Bùi Minh Đức', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '42 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p15', 'Hoàng Kim Ngân', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '43 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p15', 'Nguyễn Văn An', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '44 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p16', 'Hoàng Kim Ngân', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '45 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p17', 'Nguyễn Văn An', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '48 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p17', 'Trần Thị Mai', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '49 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p18', 'Trần Thị Mai', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '51 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p18', 'Lê Hoàng Nam', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '52 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p18', 'Phạm Quỳnh Chi', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '53 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p19', 'Lê Hoàng Nam', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '54 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p20', 'Phạm Quỳnh Chi', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '57 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p20', 'Vũ Đình Trọng', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '58 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p21', 'Vũ Đình Trọng', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '60 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p21', 'Đặng Thuỳ Linh', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '61 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p21', 'Bùi Minh Đức', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '62 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p22', 'Đặng Thuỳ Linh', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '63 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p23', 'Bùi Minh Đức', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '66 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p23', 'Hoàng Kim Ngân', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '67 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p24', 'Hoàng Kim Ngân', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '69 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p24', 'Nguyễn Văn An', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '70 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p24', 'Trần Thị Mai', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '71 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p25', 'Nguyễn Văn An', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '72 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p26', 'Trần Thị Mai', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '75 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p26', 'Lê Hoàng Nam', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '76 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p27', 'Lê Hoàng Nam', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '78 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p27', 'Phạm Quỳnh Chi', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '79 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p27', 'Vũ Đình Trọng', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '80 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p28', 'Phạm Quỳnh Chi', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '81 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p29', 'Vũ Đình Trọng', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '84 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p29', 'Đặng Thuỳ Linh', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '85 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p30', 'Đặng Thuỳ Linh', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '87 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p30', 'Bùi Minh Đức', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '88 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p30', 'Hoàng Kim Ngân', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '89 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p31', 'Bùi Minh Đức', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '90 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p32', 'Hoàng Kim Ngân', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '93 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p32', 'Nguyễn Văn An', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '94 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p33', 'Nguyễn Văn An', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '96 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p33', 'Trần Thị Mai', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '97 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p33', 'Lê Hoàng Nam', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '98 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p34', 'Trần Thị Mai', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '99 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p35', 'Lê Hoàng Nam', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '102 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p35', 'Phạm Quỳnh Chi', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '103 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p36', 'Phạm Quỳnh Chi', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '105 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p36', 'Vũ Đình Trọng', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '106 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p36', 'Đặng Thuỳ Linh', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '107 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p37', 'Vũ Đình Trọng', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '108 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p38', 'Đặng Thuỳ Linh', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '111 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p38', 'Bùi Minh Đức', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '112 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p39', 'Bùi Minh Đức', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '114 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p39', 'Hoàng Kim Ngân', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '115 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p39', 'Nguyễn Văn An', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '116 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p40', 'Hoàng Kim Ngân', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '117 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p41', 'Nguyễn Văn An', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '120 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p41', 'Trần Thị Mai', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '121 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p42', 'Trần Thị Mai', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '123 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p42', 'Lê Hoàng Nam', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '124 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p42', 'Phạm Quỳnh Chi', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '125 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p43', 'Lê Hoàng Nam', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '126 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p44', 'Phạm Quỳnh Chi', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '129 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p44', 'Vũ Đình Trọng', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '130 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p45', 'Vũ Đình Trọng', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '132 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p45', 'Đặng Thuỳ Linh', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '133 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p45', 'Bùi Minh Đức', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '134 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p46', 'Đặng Thuỳ Linh', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '135 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p47', 'Bùi Minh Đức', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '138 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p47', 'Hoàng Kim Ngân', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '139 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p48', 'Hoàng Kim Ngân', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '141 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p48', 'Nguyễn Văn An', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '142 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p48', 'Trần Thị Mai', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '143 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p49', 'Nguyễn Văn An', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '144 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p50', 'Trần Thị Mai', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '147 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p50', 'Lê Hoàng Nam', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '148 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p51', 'Lê Hoàng Nam', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '150 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p51', 'Phạm Quỳnh Chi', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '151 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p51', 'Vũ Đình Trọng', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '152 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p52', 'Phạm Quỳnh Chi', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '153 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p53', 'Vũ Đình Trọng', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '156 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p53', 'Đặng Thuỳ Linh', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '157 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p54', 'Đặng Thuỳ Linh', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '159 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p54', 'Bùi Minh Đức', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '160 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p54', 'Hoàng Kim Ngân', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '161 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p55', 'Bùi Minh Đức', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '162 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p56', 'Hoàng Kim Ngân', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '165 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p56', 'Nguyễn Văn An', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '166 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p57', 'Nguyễn Văn An', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '168 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p57', 'Trần Thị Mai', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '169 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p57', 'Lê Hoàng Nam', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '170 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p58', 'Trần Thị Mai', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '171 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p59', 'Lê Hoàng Nam', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '174 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p59', 'Phạm Quỳnh Chi', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '175 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p60', 'Phạm Quỳnh Chi', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '177 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p60', 'Vũ Đình Trọng', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '178 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p60', 'Đặng Thuỳ Linh', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '179 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p61', 'Vũ Đình Trọng', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '180 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p62', 'Đặng Thuỳ Linh', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '183 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p62', 'Bùi Minh Đức', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '184 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p63', 'Bùi Minh Đức', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '186 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p63', 'Hoàng Kim Ngân', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '187 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p63', 'Nguyễn Văn An', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '188 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p64', 'Hoàng Kim Ngân', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '189 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p65', 'Nguyễn Văn An', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '192 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p65', 'Trần Thị Mai', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '193 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p66', 'Trần Thị Mai', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '195 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p66', 'Lê Hoàng Nam', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '196 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p66', 'Phạm Quỳnh Chi', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '197 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p67', 'Lê Hoàng Nam', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '198 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p68', 'Phạm Quỳnh Chi', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '201 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p68', 'Vũ Đình Trọng', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '202 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p69', 'Vũ Đình Trọng', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '204 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p69', 'Đặng Thuỳ Linh', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '205 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p69', 'Bùi Minh Đức', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '206 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p70', 'Đặng Thuỳ Linh', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '207 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p71', 'Bùi Minh Đức', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '210 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p71', 'Hoàng Kim Ngân', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '211 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p72', 'Hoàng Kim Ngân', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '213 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p72', 'Nguyễn Văn An', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '214 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p72', 'Trần Thị Mai', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '215 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p73', 'Nguyễn Văn An', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '216 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p74', 'Trần Thị Mai', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '219 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p74', 'Lê Hoàng Nam', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '220 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p75', 'Lê Hoàng Nam', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '222 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p75', 'Phạm Quỳnh Chi', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '223 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p75', 'Vũ Đình Trọng', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '224 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p76', 'Phạm Quỳnh Chi', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '225 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p77', 'Vũ Đình Trọng', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '228 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p77', 'Đặng Thuỳ Linh', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '229 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p78', 'Đặng Thuỳ Linh', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '231 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p78', 'Bùi Minh Đức', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '232 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p78', 'Hoàng Kim Ngân', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '233 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p79', 'Bùi Minh Đức', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '234 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p80', 'Hoàng Kim Ngân', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '237 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p80', 'Nguyễn Văn An', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '238 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p81', 'Nguyễn Văn An', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '240 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p81', 'Trần Thị Mai', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '241 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p81', 'Lê Hoàng Nam', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '242 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p82', 'Trần Thị Mai', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '243 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p83', 'Lê Hoàng Nam', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '246 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p83', 'Phạm Quỳnh Chi', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '247 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p84', 'Phạm Quỳnh Chi', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '249 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p84', 'Vũ Đình Trọng', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '250 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p84', 'Đặng Thuỳ Linh', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '251 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p85', 'Vũ Đình Trọng', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '252 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p86', 'Đặng Thuỳ Linh', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '255 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p86', 'Bùi Minh Đức', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '256 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p87', 'Bùi Minh Đức', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '258 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p87', 'Hoàng Kim Ngân', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '259 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p87', 'Nguyễn Văn An', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '260 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p88', 'Hoàng Kim Ngân', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '261 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p89', 'Nguyễn Văn An', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '264 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p89', 'Trần Thị Mai', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '265 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p90', 'Trần Thị Mai', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '267 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p90', 'Lê Hoàng Nam', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '268 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p90', 'Phạm Quỳnh Chi', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '269 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p91', 'Lê Hoàng Nam', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '270 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p92', 'Phạm Quỳnh Chi', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '273 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p92', 'Vũ Đình Trọng', 5, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '274 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p93', 'Vũ Đình Trọng', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '276 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p93', 'Đặng Thuỳ Linh', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '277 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p93', 'Bùi Minh Đức', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '278 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p94', 'Đặng Thuỳ Linh', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '279 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p95', 'Bùi Minh Đức', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '282 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p95', 'Hoàng Kim Ngân', 5, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '283 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p96', 'Hoàng Kim Ngân', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '285 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p96', 'Nguyễn Văn An', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '286 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p96', 'Trần Thị Mai', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '287 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p97', 'Nguyễn Văn An', 4, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '288 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p98', 'Trần Thị Mai', 4, 'Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.', NOW() - INTERVAL '291 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p98', 'Lê Hoàng Nam', 5, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '292 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p99', 'Lê Hoàng Nam', 4, 'Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.', NOW() - INTERVAL '294 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p99', 'Phạm Quỳnh Chi', 5, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '295 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p99', 'Vũ Đình Trọng', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '296 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p100', 'Phạm Quỳnh Chi', 4, 'Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt.', NOW() - INTERVAL '297 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p101', 'Vũ Đình Trọng', 4, 'Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!', NOW() - INTERVAL '300 DAYS');
INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('p101', 'Đặng Thuỳ Linh', 5, 'Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.', NOW() - INTERVAL '301 DAYS');
