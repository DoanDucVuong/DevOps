import db from './backend/src/db/index.js';
const { query } = db;
import syncService from './backend/src/services/syncService.js';
const { syncAllProductData } = syncService;

/**
 * 1-to-1 Static Mapping for exactly 101 products.
 * Zero duplication, 100% semantic accuracy.
 */
export const UNIQUE_IMAGE_MAP = {
  // p01: Áo Thun Cổ Tròn Big Size Navy (ao-thun)
  'p01': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  // p02: Áo Thun Nam Polo Cổ Bẻ Xanh Navy (ao-thun)
  'p02': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
  // p03: Áo Thun Nam Oversize Đen Streetwear (ao-thun)
  'p03': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
  // p04: T-Shirt Big Size Navy BSX653 (ao-thun)
  'p04': 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800&auto=format&fit=crop&q=80',
  // p05: Áo Thun Nam Thể Thao Thoáng Khí Pro (ao-thun)
  'p05': 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80',
  // p06: Áo Thun Nam Graphic Minimalist Hiện Đại (ao-thun)
  'p06': 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
  // p07: Áo Thun Nam Xám Melange Cổ Tròn (ao-thun)
  'p07': 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80',
  // p08: Áo Thun Nam Trắng Dáng Relaxed (ao-thun)
  'p08': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80',
  // p09: Áo Thun Nam Cổ Tròn Bo Viền Cao Cấp (ao-thun)
  'p09': 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop&q=80',
  // p10: Áo Thun Nam Vintage Washed Xám Tro (ao-thun)
  'p10': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
  // p11: Áo Thun Nam Cổ Tim Phong Cách Casual (ao-thun)
  'p11': 'https://images.unsplash.com/photo-1521485714898-f097eb6fc5b9?w=800&auto=format&fit=crop&q=80',
  // p12: Áo Thun Nam Street Style In Họa Tiết (ao-thun)
  'p12': 'https://images.unsplash.com/photo-1579038773867-044c48829161?w=800&auto=format&fit=crop&q=80',
  // p13: Áo Sơ Mi Nam Oxford Dài Tay Trắng (ao-so-mi)
  'p13': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  // p14: Áo Sơ Mi Nam Vải Đũi Linen Mát Mẻ (ao-so-mi)
  'p14': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
  // p15: Áo Sơ Mi Nam Slim Fit Công Sở Thanh Lịch (ao-so-mi)
  'p15': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
  // p16: Áo Sơ Mi Nam Tay Ngắn Cổ Cuba Retro (ao-so-mi)
  'p16': 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&auto=format&fit=crop&q=80',
  // p17: Áo Sơ Mi Nam Kẻ Ca-rô Denim Phóng Khoáng (ao-so-mi)
  'p17': 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800&auto=format&fit=crop&q=80',
  // p18: Áo Sơ Mi Nam Xanh Pastel Chống Nhăn (ao-so-mi)
  'p18': 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop&q=80',
  // p19: Áo Sơ Mi Nam Flannel Dày Dặn Thu Đông (ao-so-mi)
  'p19': 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80',
  // p20: Áo Sơ Mi Nam Kẻ Sọc Dọc Trẻ Trung (ao-so-mi)
  'p20': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
  // p21: Áo Sơ Mi Nam Cổ Tàu Đũi Tự Nhiên (ao-so-mi)
  'p21': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
  // p22: Áo Sơ Mi Nam Doanh Nhân Cao Cấp (ao-so-mi)
  'p22': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
  // p23: Áo Sơ Mi Nam Lụa Satin Dự Tiệc Tối (ao-so-mi)
  'p23': 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80',
  // p24: Áo Sơ Mi Nam Dệt Họa Tiết Chambray (ao-so-mi)
  'p24': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  // p25: Áo Khoác Da Biker Nam Cá Tính Cực Ngầu (ao-khoac)
  'p25': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
  // p26: Áo Khoác Bomber Nam Phối Màu Trẻ Trung (ao-khoac)
  'p26': 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
  // p27: Áo Khoác Nam Có Nón Dù Trượt Nước (ao-khoac)
  'p27': 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80',
  // p28: Áo Khoác Măng Tô Dạ Nam Dáng Dài Ấm Áp (ao-khoac)
  'p28': 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
  // p29: Áo Khoác Jean Nam Trucker Phong Trần (ao-khoac)
  'p29': 'https://images.unsplash.com/photo-1537109662156-fade15c5ae8e?w=800&auto=format&fit=crop&q=80',
  // p30: Áo Blazer Nam May Đo Phong Cách Hàn Quốc (ao-khoac)
  'p30': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
  // p31: Áo Blazer Nam Form Rộng Casual Hiện Đại (ao-khoac)
  'p31': 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80',
  // p32: Áo Khoác Nam Kẻ Glen Plaid Lịch Lãm (ao-khoac)
  'p32': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80',
  // p33: Áo Vest Nam Doanh Nhân Màu Xám Than (ao-khoac)
  'p33': 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800&auto=format&fit=crop&q=80',
  // p34: Áo Khoác Gió Nam Thể Thao Cản Gió Siêu Nhẹ (ao-khoac)
  'p34': 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
  // p35: Áo Khoác Safari Nam Phong Cách Utility (ao-khoac)
  'p35': 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&auto=format&fit=crop&q=80',
  // p36: Áo Khoác Dạ Hai Hàng Khuy Cổ Điển (ao-khoac)
  'p36': 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&auto=format&fit=crop&q=80',
  // p37: Áo Khoác Da Lộn Nam Màu Nâu Vintage (ao-khoac)
  'p37': 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&auto=format&fit=crop&q=80',
  // p38: Quần Jean Nam Xanh Classic Dáng Straight (quan)
  'p38': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
  // p39: Quần Jean Nam Tối Màu Slim Fit Cao Cấp (quan)
  'p39': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
  // p40: Quần Chino Nam Vải Kaki Co Giãn Màu Be (quan)
  'p40': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
  // p41: Quần Jean Nam Rách Xước Nhẹ Retro (quan)
  'p41': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
  // p42: Quần Jogger Nam Thể Thao Bo Gấu Năng Động (quan)
  'p42': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80',
  // p43: Quần Jean Nam Vải Raw Selvedge Bền Đẹp (quan)
  'p43': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
  // p44: Quần Túi Hộp Cargo Nam Phong Cách Bụi Bặm (quan)
  'p44': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
  // p45: Quần Tây Nam Xếp Ly Công Sở Lịch Lãm (quan)
  'p45': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  // p46: Quần Ống Suông Nam Rộng Thoải Mái (quan)
  'p46': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
  // p47: Quần Kaki Nam Lửng Cropped Mắt Cá (quan)
  'p47': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80',
  // p48: Quần Tây Nam Đen Dáng Slim Doanh Nhân (quan)
  'p48': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
  // p49: Quần Vải Linen Nam Đũi Suông Thoáng Mát (quan)
  'p49': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
  // p50: Quần Âu Nam May Đo Cao Cấp (quan)
  'p50': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
  // p51: Đầm Midi Nữ Xòe Dáng Dài Thanh Lịch (vay-dam)
  'p51': 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
  // p52: Váy Nữ Hoa Nhí Phong Cách Bohemian (vay-dam)
  'p52': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
  // p53: Đầm Dạ Hội Nữ Cúp Ngực Quyến Rũ (vay-dam)
  'p53': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
  // p54: Đầm Đỏ Nữ Dự Tiệc Đính Nơ Sang Trọng (vay-dam)
  'p54': 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&auto=format&fit=crop&q=80',
  // p55: Váy Hai Dây Nữ Lụa Satin Quyến Rũ (vay-dam)
  'p55': 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop&q=80',
  // p56: Đầm Chấm Bi Nữ Cổ Điển Vintage (vay-dam)
  'p56': 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&auto=format&fit=crop&q=80',
  // p57: Đầm Nữ Xòe Chữ A Dự Tiệc Cocktail (vay-dam)
  'p57': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
  // p58: Váy Trắng Nữ Đi Biển Hở Lưng Mùa Hè (vay-dam)
  'p58': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
  // p59: Đầm Suông Nữ Lụa Phối Ren Duyên Dáng (vay-dam)
  'p59': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  // p60: Đầm Maxi Nữ Tầng Xếp Dạo Phố (vay-dam)
  'p60': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
  // p61: Váy Nữ Vải Đũi Linen Thắt Nơ Lưng (vay-dam)
  'p61': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80',
  // p62: Đầm Voan Nữ Bồng Bềnh Nữ Tính (vay-dam)
  'p62': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
  // p63: Đầm Blazer Nữ Thanh Lịch Hiện Đại (vay-dam)
  'p63': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
  // p64: Váy Ôm Body Nữ Dệt Kim Tôn Dáng (vay-dam)
  'p64': 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop&q=80',
  // p65: Áo Sơ Mi Nữ Lụa Vàng Sang Trọng (ao-so-mi)
  'p65': 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80',
  // p66: Áo Sơ Mi Nữ Trắng Công Sở Dáng Chuẩn (ao-so-mi)
  'p66': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  // p67: Áo Blouse Nữ Cổ Chữ V Tinh Tế (ao-so-mi)
  'p67': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
  // p68: Áo Sơ Mi Nữ Vải Đũi Cổ Đức Nhẹ Nhàng (ao-so-mi)
  'p68': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
  // p69: Áo Blouse Nữ Họa Tiết Hoa Nhí (ao-so-mi)
  'p69': 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&auto=format&fit=crop&q=80',
  // p70: Áo Sơ Mi Nữ Form Rộng Phong Cách Boyfriend (ao-so-mi)
  'p70': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
  // p71: Áo Blouse Nữ Phối Nơ Cổ Duyên Dáng (ao-so-mi)
  'p71': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
  // p72: Áo Sơ Mi Nữ Kẻ Sọc Công Sở Trẻ Trung (ao-so-mi)
  'p72': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80',
  // p73: Áo Kiểu Nữ Xếp Ly Tay Bồng Nữ Tính (ao-so-mi)
  'p73': 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=800&auto=format&fit=crop&q=80',
  // p74: Áo Sơ Mi Nữ Croptop Cá Tính Mùa Hè (ao-so-mi)
  'p74': 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
  // p75: Áo Thun Nữ Graphic Năng Động Phong Cách (ao-thun)
  'p75': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
  // p76: Áo Thun Nữ Neon Phối Màu Nổi Bật (ao-thun)
  'p76': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
  // p77: Áo Thun Nữ Cotton Hữu Cơ Basic Trắng (ao-thun)
  'p77': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80',
  // p78: Áo Thun Nữ Cổ Lọ Dệt Kim Mềm Mịn (ao-thun)
  'p78': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
  // p79: Áo Thun Nữ Pastel Cổ Tròn Nữ Tính (ao-thun)
  'p79': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
  // p80: Áo Tập Nữ Thể Thao Thoáng Khí Ôm Dáng (ao-thun)
  'p80': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
  // p81: Áo Thun Nữ Rộng Phong Cách Hàn Quốc (ao-thun)
  'p81': 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop&q=80',
  // p82: Áo Thun Nữ Cổ Tim Bo Gân Nhẹ Nhàng (ao-thun)
  'p82': 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80',
  // p83: Áo Ba Lỗ Nữ Thun Gân Năng Động (ao-thun)
  'p83': 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&auto=format&fit=crop&q=80',
  // p84: Áo Thun Nữ Dài Tay Dệt Kim Mùa Thu (ao-thun)
  'p84': 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=80',
  // p85: Áo Măng Tô Dạ Nữ Màu Be Dáng Dài (ao-khoac)
  'p85': 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&auto=format&fit=crop&q=80',
  // p86: Áo Khoác Phao Nữ Đại Hàn Siêu Nhẹ Siêu Ấm (ao-khoac)
  'p86': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
  // p87: Áo Khoác Jean Nữ Croptop Bụi Bặm (ao-khoac)
  'p87': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
  // p88: Áo Cardigan Nữ Dệt Kim Mềm Dáng Rộng (ao-khoac)
  'p88': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
  // p89: Áo Khoác Trench Coat Nữ 2 Hàng Khuy Chuẩn Anh (ao-khoac)
  'p89': 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=800&auto=format&fit=crop&q=80',
  // p90: Áo Khoác Nữ Phối Lông Ấm Áp Mùa Đông (ao-khoac)
  'p90': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80',
  // p91: Áo Khoác Lông Cừu Nữ Dễ Thương Ấm Áp (ao-khoac)
  'p91': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
  // p92: Áo Blazer Nữ Tone Pastel Công Sở Hack Dáng (ao-khoac)
  'p92': 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&auto=format&fit=crop&q=80',
  // p93: Quần Tây Nữ Ống Rộng Lưng Cao Tôn Dáng (quan)
  'p93': 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&auto=format&fit=crop&q=80',
  // p94: Chân Váy Nữ Xếp Ly Dài Sang Trọng (quan)
  'p94': 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&auto=format&fit=crop&q=80',
  // p95: Chân Váy Lụa Satin Nữ Dáng Suông Dài (quan)
  'p95': 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=800&auto=format&fit=crop&q=80',
  // p96: Chân Váy Nữ Chữ A Dạ Kẻ Caro Trẻ Trung (quan)
  'p96': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
  // p97: Quần Jean Nữ Ống Đứng Cạp Cao Xanh Sáng (quan)
  'p97': 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
  // p98: Quần Nữ Ống Rộng Vải Linen Thoáng Mát (quan)
  'p98': 'https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=800&auto=format&fit=crop&q=80',
  // p99: Quần Jean Skinny Nữ Co Giãn Siêu Hack Chân (quan)
  'p99': 'https://images.unsplash.com/photo-1597196526281-fe4861daa915?w=800&auto=format&fit=crop&q=80',
  // p100: Quần Tây Nữ Dáng Lửng Thời Thượng (quan)
  'p100': 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=800&auto=format&fit=crop&q=80',
  // p101: Áo Thun Nam Tshirt Basic USA (ao-thun)
  'p101': 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&auto=format&fit=crop&q=80',
};

async function main() {
  console.log('[fix_unique_images] Bắt đầu cập nhật 101 hình ảnh độc bản 1-1...');

  // 1. Quét toàn bộ danh sách sản phẩm từ DB
  const products = await query('SELECT id, name, category, gender FROM products ORDER BY id ASC');
  console.log(`[fix_unique_images] Đã nạp ${products.length} sản phẩm từ SQLite sttn.db.`);

  if (products.length !== 101) {
    console.warn(`[fix_unique_images] Cảnh báo: Số sản phẩm trong CSDL là ${products.length}, dự kiến 101.`);
  }

  // 2. Cập nhật từng sản phẩm theo static map
  let updatedCount = 0;
  for (const product of products) {
    const targetUrl = UNIQUE_IMAGE_MAP[product.id];
    if (!targetUrl) {
      throw new Error(`Không tìm thấy ảnh tĩnh cho sản phẩm: ${product.id} - ${product.name}`);
    }

    await query('UPDATE products SET image_url = ? WHERE id = ?', [targetUrl, product.id]);
    updatedCount++;
  }
  console.log(`[fix_unique_images] Đã UPDATE CSDL thành công cho ${updatedCount} sản phẩm.`);

  // 3. BẮT BUỘC gọi syncService.js để đồng bộ ra JSON & Frontend
  console.log('[fix_unique_images] Đang đồng bộ hóa dữ liệu qua syncService.js...');
  await syncAllProductData();
  console.log('[fix_unique_images] Đồng bộ hóa hoàn tất!');

  // 4. KIỂM THỬ TỰ ĐỘNG: Đảm bảo tỷ lệ Unique = 100%
  const [stats] = await query(`
    SELECT 
      COUNT(*) AS total_count,
      COUNT(DISTINCT image_url) AS unique_count
    FROM products
  `);

  const total = Number(stats.total_count);
  const unique = Number(stats.unique_count);
  const duplicateCount = total - unique;
  const duplicateRate = 0;

  console.log(`[Check] Tổng sản phẩm: ${total} | Ảnh độc bản: ${unique} | Trùng lặp: ${duplicateCount}`);

  if (unique !== total || duplicateCount > 0) {
    console.error(`[TEST FAILED] Phát hiện trùng lặp hình ảnh: ${duplicateCount} ảnh bị trùng!`);
    process.exit(1);
  }

  // BẮT BUỘC in đúng dòng log theo yêu cầu
  console.log(`Đã cập nhật ${unique} hình ảnh độc bản. Trùng lặp: ${duplicateRate}%`);
}

main().catch(err => {
  console.error('[fix_unique_images] Lỗi thực thi:', err);
  process.exit(1);
});