// =====================================================
// VIETNAM PROVINCES AND DISTRICTS DATA
// 63 Tỉnh/Thành phố Việt Nam
// =====================================================

const VietnamData = {
    provinces: [
        { id: 'hanoi', name: 'Hà Nội' },
        { id: 'hochiminh', name: 'TP. Hồ Chí Minh' },
        { id: 'danang', name: 'Đà Nẵng' },
        { id: 'haiphong', name: 'Hải Phòng' },
        { id: 'cantho', name: 'Cần Thơ' },
        { id: 'angiang', name: 'An Giang' },
        { id: 'bariavungtau', name: 'Bà Rịa - Vũng Tàu' },
        { id: 'bacgiang', name: 'Bắc Giang' },
        { id: 'backan', name: 'Bắc Kạn' },
        { id: 'baclieu', name: 'Bạc Liêu' },
        { id: 'bacninh', name: 'Bắc Ninh' },
        { id: 'bentre', name: 'Bến Tre' },
        { id: 'binhdinh', name: 'Bình Định' },
        { id: 'binhduong', name: 'Bình Dương' },
        { id: 'binhphuoc', name: 'Bình Phước' },
        { id: 'binhthuan', name: 'Bình Thuận' },
        { id: 'camau', name: 'Cà Mau' },
        { id: 'caobang', name: 'Cao Bằng' },
        { id: 'daklak', name: 'Đắk Lắk' },
        { id: 'daknong', name: 'Đắk Nông' },
        { id: 'dienbien', name: 'Điện Biên' },
        { id: 'dongnai', name: 'Đồng Nai' },
        { id: 'dongthap', name: 'Đồng Tháp' },
        { id: 'gialai', name: 'Gia Lai' },
        { id: 'hagiang', name: 'Hà Giang' },
        { id: 'hanam', name: 'Hà Nam' },
        { id: 'hatinh', name: 'Hà Tĩnh' },
        { id: 'haiduong', name: 'Hải Dương' },
        { id: 'haugiang', name: 'Hậu Giang' },
        { id: 'hoabinh', name: 'Hòa Bình' },
        { id: 'hungyen', name: 'Hưng Yên' },
        { id: 'khanhhoa', name: 'Khánh Hòa' },
        { id: 'kiengiang', name: 'Kiên Giang' },
        { id: 'kontum', name: 'Kon Tum' },
        { id: 'laichau', name: 'Lai Châu' },
        { id: 'lamdong', name: 'Lâm Đồng' },
        { id: 'langson', name: 'Lạng Sơn' },
        { id: 'laocai', name: 'Lào Cai' },
        { id: 'longan', name: 'Long An' },
        { id: 'namdinh', name: 'Nam Định' },
        { id: 'nghean', name: 'Nghệ An' },
        { id: 'ninhbinh', name: 'Ninh Bình' },
        { id: 'ninhthuan', name: 'Ninh Thuận' },
        { id: 'phutho', name: 'Phú Thọ' },
        { id: 'phuyen', name: 'Phú Yên' },
        { id: 'quangbinh', name: 'Quảng Bình' },
        { id: 'quangnam', name: 'Quảng Nam' },
        { id: 'quangngai', name: 'Quảng Ngãi' },
        { id: 'quangninh', name: 'Quảng Ninh' },
        { id: 'quangtri', name: 'Quảng Trị' },
        { id: 'soctrang', name: 'Sóc Trăng' },
        { id: 'sonla', name: 'Sơn La' },
        { id: 'tayninh', name: 'Tây Ninh' },
        { id: 'thaibinh', name: 'Thái Bình' },
        { id: 'thainguyen', name: 'Thái Nguyên' },
        { id: 'thanhhoa', name: 'Thanh Hóa' },
        { id: 'thuathienhue', name: 'Thừa Thiên Huế' },
        { id: 'tiengiang', name: 'Tiền Giang' },
        { id: 'travinh', name: 'Trà Vinh' },
        { id: 'tuyenquang', name: 'Tuyên Quang' },
        { id: 'vinhlong', name: 'Vĩnh Long' },
        { id: 'vinhphuc', name: 'Vĩnh Phúc' },
        { id: 'yenbai', name: 'Yên Bái' }
    ],

    // Districts by province (simplified - common districts)
    districts: {
        'hochiminh': [
            { id: 'q1', name: 'Quận 1' },
            { id: 'q2', name: 'Quận 2 (TP. Thủ Đức)' },
            { id: 'q3', name: 'Quận 3' },
            { id: 'q4', name: 'Quận 4' },
            { id: 'q5', name: 'Quận 5' },
            { id: 'q6', name: 'Quận 6' },
            { id: 'q7', name: 'Quận 7' },
            { id: 'q8', name: 'Quận 8' },
            { id: 'q9', name: 'Quận 9 (TP. Thủ Đức)' },
            { id: 'q10', name: 'Quận 10' },
            { id: 'q11', name: 'Quận 11' },
            { id: 'q12', name: 'Quận 12' },
            { id: 'binhthanh', name: 'Bình Thạnh' },
            { id: 'tanbinh', name: 'Tân Bình' },
            { id: 'tanphu', name: 'Tân Phú' },
            { id: 'phunhuan', name: 'Phú Nhuận' },
            { id: 'govap', name: 'Gò Vấp' },
            { id: 'binhtan', name: 'Bình Tân' },
            { id: 'thuduc', name: 'TP. Thủ Đức' },
            { id: 'nhabe', name: 'Nhà Bè' },
            { id: 'cangio', name: 'Cần Giờ' },
            { id: 'hocmon', name: 'Hóc Môn' },
            { id: 'binhtanchanh', name: 'Bình Chánh' },
            { id: 'cuci', name: 'Củ Chi' }
        ],
        'hanoi': [
            { id: 'badinh', name: 'Ba Đình' },
            { id: 'hoankiem', name: 'Hoàn Kiếm' },
            { id: 'dongda', name: 'Đống Đa' },
            { id: 'haibatrung', name: 'Hai Bà Trưng' },
            { id: 'caugiay', name: 'Cầu Giấy' },
            { id: 'thanhxuan', name: 'Thanh Xuân' },
            { id: 'hoangmai', name: 'Hoàng Mai' },
            { id: 'longbien', name: 'Long Biên' },
            { id: 'tayho', name: 'Tây Hồ' },
            { id: 'hadong', name: 'Hà Đông' },
            { id: 'namtuliem', name: 'Nam Từ Liêm' },
            { id: 'bactuliem', name: 'Bắc Từ Liêm' },
            { id: 'thanhtrj', name: 'Thanh Trì' },
            { id: 'gialam', name: 'Gia Lâm' },
            { id: 'donganh', name: 'Đông Anh' },
            { id: 'soctrang', name: 'Sóc Sơn' },
            { id: 'melinh', name: 'Mê Linh' },
            { id: 'hoaiduc', name: 'Hoài Đức' }
        ],
        'danang': [
            { id: 'haichau', name: 'Hải Châu' },
            { id: 'thanhkhe', name: 'Thanh Khê' },
            { id: 'sontra', name: 'Sơn Trà' },
            { id: 'nguhanhson', name: 'Ngũ Hành Sơn' },
            { id: 'camle', name: 'Cẩm Lệ' },
            { id: 'lienchieu', name: 'Liên Chiểu' },
            { id: 'hoavang', name: 'Hòa Vang' }
        ],
        'dongnai': [
            { id: 'bienhoa', name: 'TP. Biên Hòa' },
            { id: 'longkhanh', name: 'TP. Long Khánh' },
            { id: 'trangbom', name: 'Trảng Bom' },
            { id: 'vinhcuu', name: 'Vĩnh Cửu' },
            { id: 'nhontramch', name: 'Nhơn Trạch' },
            { id: 'longthach', name: 'Long Thành' },
            { id: 'cammy', name: 'Cẩm Mỹ' },
            { id: 'thongnat', name: 'Thống Nhất' },
            { id: 'dinquan', name: 'Định Quán' },
            { id: 'xuanloc', name: 'Xuân Lộc' },
            { id: 'tanphu', name: 'Tân Phú' }
        ],
        'binhduong': [
            { id: 'thudaumot', name: 'TP. Thủ Dầu Một' },
            { id: 'dian', name: 'TP. Dĩ An' },
            { id: 'thuanan', name: 'TP. Thuận An' },
            { id: 'tanuyen', name: 'TP. Tân Uyên' },
            { id: 'bencat', name: 'TX. Bến Cát' },
            { id: 'baubang', name: 'Bàu Bàng' },
            { id: 'dautieng', name: 'Dầu Tiếng' },
            { id: 'phugioo', name: 'Phú Giáo' },
            { id: 'bacdongtay', name: 'Bắc Tân Uyên' }
        ],
        'bariavungtau': [
            { id: 'vungtau', name: 'TP. Vũng Tàu' },
            { id: 'baria', name: 'TP. Bà Rịa' },
            { id: 'longdien', name: 'Long Điền' },
            { id: 'datdo', name: 'Đất Đỏ' },
            { id: 'xuyenmoc', name: 'Xuyên Mộc' },
            { id: 'chauduc', name: 'Châu Đức' },
            { id: 'tanphanh', name: 'Tân Thành' },
            { id: 'condao', name: 'Côn Đảo' }
        ],
        'longan': [
            { id: 'tanan', name: 'TP. Tân An' },
            { id: 'kienhxung', name: 'TX. Kiến Tường' },
            { id: 'benluc', name: 'Bến Lức' },
            { id: 'canjuoc', name: 'Cần Đước' },
            { id: 'cangiuoc', name: 'Cần Giuộc' },
            { id: 'duchueyy', name: 'Đức Huệ' },
            { id: 'duchoa', name: 'Đức Hòa' },
            { id: 'mochua', name: 'Mộc Hóa' },
            { id: 'tanthanh', name: 'Tân Thạnh' },
            { id: 'tantr', name: 'Tân Trụ' },
            { id: 'thanhhoa', name: 'Thạnh Hóa' },
            { id: 'tuthung', name: 'Thủ Thừa' },
            { id: 'vinhhung', name: 'Vĩnh Hưng' },
            { id: 'chauannh', name: 'Châu Thành' }
        ]
        // Thêm các tỉnh khác khi cần
    },

    // Get provinces list
    getProvinces() {
        return this.provinces.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    },

    // Get districts by province
    getDistricts(provinceId) {
        return this.districts[provinceId] || [];
    },

    // Get province by ID
    getProvince(id) {
        return this.provinces.find(p => p.id === id);
    },

    // Get district by ID
    getDistrict(provinceId, districtId) {
        const districts = this.districts[provinceId] || [];
        return districts.find(d => d.id === districtId);
    }
};

// Make globally available
window.VietnamData = VietnamData;
