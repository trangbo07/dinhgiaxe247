import type { LegalSectionData } from './LegalSection'

export const termsToc = [
  { id: 'tong-quan', label: 'Tổng quan' },
  { id: 'muc-1', label: 'Dịch vụ ValuCar' },
  { id: 'muc-2', label: 'Người dùng & tài khoản' },
  { id: 'muc-3', label: 'Định giá & kết quả' },
  { id: 'muc-4', label: 'Gói doanh nghiệp' },
  { id: 'muc-5', label: 'Thanh toán' },
  { id: 'muc-6', label: 'Nội dung & bản quyền' },
  { id: 'muc-7', label: 'Trách nhiệm pháp lý' },
  { id: 'muc-8', label: 'Chấm dứt & thay đổi' },
  { id: 'muc-9', label: 'Liên hệ' },
] as const

export const termsSections: LegalSectionData[] = [
  {
    id: 'muc-1',
    number: '01',
    title: 'Dịch vụ ValuCar là gì?',
    icon: 'tabler:car',
    intro:
      'ValuCar là website hỗ trợ <strong>định giá tham chiếu</strong> xe ô tô tại Việt Nam, kết hợp dữ liệu thị trường và công cụ phân tích tự động.',
    bullets: [
      'Khách có thể tra cứu miễn phí khoảng giá sau khi nhập thông tin xe và (nếu muốn xem đầy đủ) cung cấp thông tin liên hệ.',
      'Doanh nghiệp (salon, đại lý) có thể đăng ký tài khoản và gói trả phí để định giá nhiều lần, lưu lịch sử và xem thông tin khách đã tra cứu trên nền tảng.',
      'ValuCar <strong>không</strong> trực tiếp mua bán xe, không thay mặt bạn ký hợp đồng giao dịch và không đảm bảo có người mua/bán ngay sau khi tra cứu.',
    ],
    callout: {
      variant: 'info',
      title: 'Lưu ý quan trọng',
      body: 'Kết quả trên website là tham khảo để bạn ra quyết định. Giá chốt thực tế phụ thuộc tình trạng xe, vùng miền, thời điểm và thương lượng giữa các bên.',
    },
  },
  {
    id: 'muc-2',
    number: '02',
    title: 'Điều kiện sử dụng và tài khoản',
    icon: 'tabler:user-circle',
    subsections: [
      {
        title: 'Ai được sử dụng?',
        bullets: [
          'Bạn từ 18 tuổi trở lên, hoặc có sự đồng ý của người giám hộ hợp pháp.',
          'Tài khoản doanh nghiệp chỉ dành cho tổ chức có pháp nhân hoặc hộ kinh doanh đang hoạt động hợp pháp tại Việt Nam.',
        ],
      },
      {
        title: 'Trách nhiệm của bạn',
        bullets: [
          'Cung cấp thông tin xe và liên hệ <strong>trung thực, chính xác</strong> trong khả năng tốt nhất.',
          'Không đăng nhập trái phép, không cố tình làm quá tải hệ thống hoặc dùng công cụ tự động để gọi dịch vụ hàng loạt.',
          'Bảo mật mật khẩu tài khoản doanh nghiệp; mọi hoạt động dưới tài khoản của bạn do bạn chịu trách nhiệm.',
        ],
      },
    ],
  },
  {
    id: 'muc-3',
    number: '03',
    title: 'Định giá và kết quả hiển thị',
    icon: 'tabler:calculator',
    bullets: [
      'Giá hiển thị là <strong>khoảng tham chiếu</strong> dựa trên thông tin bạn nhập và dữ liệu thị trường tại thời điểm tra cứu.',
      'ValuCar có thể điều chỉnh kết quả theo nhu cầu mua hoặc bán (nếu bạn đã chọn) và theo quy tắc nội bộ đã công bố trên website.',
      'Chúng tôi nỗ lực cập nhật dữ liệu nhưng không cam kết kết quả luôn trùng khớp với mọi tin đăng hoặc giao dịch thực tế.',
      'Bạn không được trích xuất hàng loạt, sao chép hệ thống hoặc dùng kết quả để tạo sản phẩm cạnh tranh trực tiếp mà chưa có sự đồng ý bằng văn bản của ValuCar.',
    ],
  },
  {
    id: 'muc-4',
    number: '04',
    title: 'Gói doanh nghiệp và thông tin khách tra cứu',
    icon: 'tabler:building-store',
    paragraphs: [
      'Khi khách tra cứu miễn phí và gửi form liên hệ, thông tin có thể hiển thị cho đơn vị đang sử dụng gói doanh nghiệp hợp lệ trên ValuCar — để gọi tư vấn, không để gửi tin rác hoặc chuyển cho bên thứ ba không liên quan.',
    ],
    bullets: [
      'Đơn vị dùng gói doanh nghiệp cam kết liên hệ khách hàng <strong>đúng mục đích tư vấn mua bán xe</strong>, tôn trọng quyền riêng tư và pháp luật Việt Nam.',
      'ValuCar có quyền tạm khóa hoặc chấm dứt tài khoản doanh nghiệp nếu phát hiện lạm dụng, quấy rối khách hàng hoặc vi phạm điều khoản.',
      'Chi tiết quyền lợi từng gói (số lượt định giá, tính năng) theo mô tả tại mục Bảng giá trên website tại thời điểm đăng ký.',
    ],
  },
  {
    id: 'muc-5',
    number: '05',
    title: 'Thanh toán và hoàn tiền',
    icon: 'tabler:credit-card',
    bullets: [
      'Gói trả phí (nếu có) được niêm yết công khai trên website. Bạn thanh toán theo hướng dẫn tại thời điểm mua gói.',
      'Trừ khi pháp luật bắt buộc hoặc ValuCar có chính sách khuyến mãi riêng, phí gói đã kích hoạt thường <strong>không hoàn lại</strong> sau khi bạn đã sử dụng dịch vụ.',
      'ValuCar có thể tạm ngưng hoặc điều chỉnh giá gói; thay đổi áp dụng cho kỳ thanh toán tiếp theo, không hồi tố với gói đang dùng trừ khi có thông báo khác.',
    ],
  },
  {
    id: 'muc-6',
    number: '06',
    title: 'Nội dung, thương hiệu và bản quyền',
    icon: 'tabler:copyright',
    bullets: [
      'Logo, giao diện, văn bản hướng dẫn và phần mềm ValuCar thuộc quyền sở hữu của ValuCar hoặc bên cấp phép hợp pháp.',
      'Bạn được phép xem và dùng website cho mục đích cá nhân hoặc kinh doanh hợp pháp theo gói đã đăng ký, không được sao chép toàn bộ hệ thống hoặc kinh doanh lại dưới tên khác gây nhầm lẫn.',
      'Mọi phản hồi, góp ý bạn gửi cho ValuCar có thể được chúng tôi sử dụng để cải thiện dịch vụ mà không bắt buộc trả thù lao.',
    ],
  },
  {
    id: 'muc-7',
    number: '07',
    title: 'Giới hạn trách nhiệm',
    icon: 'tabler:scale',
    paragraphs: [
      'ValuCar cung cấp dịch vụ trên cơ sở “nguyên trạng” và “theo khả năng hiện có”. Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp, mất lợi nhuận, mất cơ hội kinh doanh hoặc tranh chấp giữa bạn với bên thứ ba phát sinh từ việc dựa hoàn toàn vào kết quả định giá.',
      'Tổng trách nhiệm bồi thường trực tiếp (nếu có) của ValuCar đối với một sự việc không vượt quá số tiền bạn đã trả cho gói dịch vụ trong 03 (ba) tháng gần nhất trước sự việc đó, hoặc theo mức pháp luật bắt buộc nếu cao hơn.',
    ],
    callout: {
      variant: 'alert',
      title: 'Tư vấn chuyên môn',
      body: 'Với giao dịch giá trị lớn, bạn nên kiểm tra thực tế xe, hồ sơ pháp lý và tham khảo thêm chuyên gia — không chỉ dựa vào một lần tra cứu trên website.',
    },
  },
  {
    id: 'muc-8',
    number: '08',
    title: 'Chấm dứt, thay đổi điều khoản và luật áp dụng',
    icon: 'tabler:file-text',
    bullets: [
      'Bạn có thể ngừng sử dụng dịch vụ bất cứ lúc nào. ValuCar có thể tạm khóa hoặc chấm dứt quyền truy cập nếu bạn vi phạm điều khoản hoặc có hành vi gây hại cho hệ thống hoặc người dùng khác.',
      'ValuCar có thể cập nhật điều khoản; bản mới đăng tại trang này kèm ngày cập nhật. Tiếp tục dùng dịch vụ sau khi công bố nghĩa là bạn chấp nhận nội dung mới.',
      'Điều khoản được giải thích theo pháp luật Việt Nam. Tranh chấp ưu tiên thương lượng; không thống nhất được thì Tòa án có thẩm quyền tại Việt Nam giải quyết.',
    ],
  },
  {
    id: 'muc-9',
    number: '09',
    title: 'Liên hệ',
    icon: 'tabler:headset',
    intro: 'Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ ValuCar:',
  },
]
