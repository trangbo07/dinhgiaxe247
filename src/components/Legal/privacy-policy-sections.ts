import type { LegalSectionData } from './LegalSection'

export const privacyPolicyToc = [
  { id: 'tong-quan', label: 'Tổng quan' },
  { id: 'muc-1', label: 'Thu thập thông tin' },
  { id: 'muc-2', label: 'Sử dụng thông tin' },
  { id: 'muc-3', label: 'Lưu trữ' },
  { id: 'muc-4', label: 'Gói doanh nghiệp' },
  { id: 'muc-5', label: 'Bảo mật' },
  { id: 'muc-6', label: 'Quyền của bạn' },
  { id: 'muc-7', label: 'Khiếu nại' },
  { id: 'muc-8', label: 'Cập nhật' },
] as const

export const privacyPolicySections: LegalSectionData[] = [
  {
    id: 'muc-1',
    number: '01',
    title: 'Mục đích và phạm vi thu thập',
    icon: 'tabler:database-search',
    intro:
      'ValuCar chỉ thu thập thông tin khi cần để định giá xe, hỗ trợ bạn và vận hành website an toàn.',
    subsections: [
      {
        title: 'Chúng tôi thu thập để làm gì?',
        bullets: [
          'Tính và hiển thị <strong>khoảng giá tham chiếu</strong> theo thông tin xe bạn nhập.',
          'Lưu thông tin liên hệ và kết quả định giá để đơn vị dùng <strong>gói doanh nghiệp</strong> có thể gọi tư vấn cho bạn (nếu bạn đã gửi form liên hệ).',
          'Quản lý tài khoản công ty, lịch sử định giá và gói dịch vụ đã đăng ký.',
          'Chống lạm dụng dịch vụ và cải thiện độ chính xác định giá.',
        ],
      },
      {
        title: 'Thông tin nào có thể được thu thập?',
        paragraphs: [
          '<strong>Khi tra cứu miễn phí:</strong> họ tên, số điện thoại, bạn muốn mua hay bán xe, thông tin xe, kết quả định giá. Sau khi bạn gửi form liên hệ, các thông tin này có thể được lưu và hiển thị cho đơn vị đang dùng gói doanh nghiệp để liên hệ tư vấn.',
          '<strong>Khi đăng ký tài khoản doanh nghiệp:</strong> tên công ty, email, mật khẩu (được bảo vệ khi đăng nhập), thông tin công ty trong mục Cài đặt, lịch sử định giá và danh sách khách đã tra cứu (theo quyền của gói).',
          '<strong>Thông tin kỹ thuật:</strong> thời điểm truy cập, phiên đăng nhập — để bảo vệ tài khoản và website.',
        ],
        highlight:
          'Gói doanh nghiệp giúp salon, đại lý xem thông tin khách đã định giá trên ValuCar để tư vấn — đây là tính năng trong dịch vụ, không phải bán danh sách ra bên ngoài.',
      },
    ],
  },
  {
    id: 'muc-2',
    number: '02',
    title: 'Cách chúng tôi sử dụng thông tin',
    icon: 'tabler:settings-automation',
    bullets: [
      'Hiển thị kết quả định giá và lưu lại khi bạn gửi form liên hệ.',
      'Cho phép đơn vị dùng <strong>gói doanh nghiệp</strong> xem thông tin khách đã tra cứu để gọi tư vấn, báo giá và chăm sóc — đúng với tính năng đã công bố trên website.',
      'Trả lời thắc mắc, thông báo về gói dịch vụ hoặc tính năng mới.',
      'Bảo vệ hệ thống khỏi truy cập bất thường hoặc lạm dụng.',
      'Thống kê tổng hợp (có thể không gắn tên cụ thể) để cải thiện dịch vụ định giá.',
      'Cung cấp cho cơ quan có thẩm quyền khi pháp luật yêu cầu.',
    ],
  },
  {
    id: 'muc-3',
    number: '03',
    title: 'Lưu trữ và thời gian giữ thông tin',
    icon: 'tabler:cloud-lock',
    paragraphs: [
      'Thông tin khách tra cứu và lịch sử định giá được lưu trên máy chủ bảo mật. Với gói miễn phí, trình duyệt có thể ghi nhớ số lần tra cứu trong tháng.',
      'ValuCar giữ thông tin trong thời gian cần cho các mục đích trên, hoặc đến khi bạn yêu cầu xóa — trừ khi pháp luật bắt buộc lưu lâu hơn.',
    ],
  },
  {
    id: 'muc-4',
    number: '04',
    title: 'Gói doanh nghiệp và chia sẻ thông tin',
    icon: 'tabler:users-group',
    intro:
      'Thông tin bạn gửi khi tra cứu có thể được dùng trong nền tảng ValuCar, đặc biệt cho khách hàng đang trả phí <strong>gói doanh nghiệp</strong>. Ngoài ra, thông tin chỉ được tiếp cận trong các trường hợp sau:',
    bullets: [
      '<strong>Đơn vị dùng gói doanh nghiệp:</strong> họ tên, số điện thoại, thông tin xe, giá tham chiếu và nhu cầu mua/bán hiển thị trong mục quản lý khách — chỉ để tư vấn, không được gửi tin rác, quảng cáo lạ hoặc chuyển cho bên khác.',
      '<strong>Nhà cung cấp hạ tầng:</strong> dịch vụ lưu trữ và đăng nhập — chỉ để website hoạt động ổn định.',
      '<strong>Hệ thống định giá tự động:</strong> chỉ dùng thông tin xe (hãng, dòng, năm, màu, km); <strong>không gửi họ tên hay số điện thoại</strong> trong bước tính giá tự động.',
      '<strong>Cơ quan nhà nước:</strong> khi có yêu cầu hợp pháp.',
    ],
    callout: {
      variant: 'info',
      title: 'Vì sao có gói doanh nghiệp?',
      body: 'Salon, đại lý trả phí gói doanh nghiệp để xem thông tin khách đã định giá trên ValuCar và liên hệ tư vấn. Đây là một phần dịch vụ trên nền tảng — mọi truy cập gắn với tài khoản đã đăng ký và chỉ phục vụ tư vấn mua bán xe.',
    },
  },
  {
    id: 'muc-5',
    number: '05',
    title: 'Cam kết bảo mật',
    icon: 'tabler:shield-lock',
    bullets: [
      'Chỉ dùng và chia sẻ thông tin đúng với mục đích đã nêu: định giá, hỗ trợ bạn, gói doanh nghiệp, vận hành website — không chuyển cho bên ngoài vì mục đích không liên quan đến ValuCar.',
      'Website dùng kết nối mã hóa, phân quyền tài khoản và các biện pháp bảo vệ phù hợp.',
      'Người có quyền truy cập dữ liệu phải tuân thủ quy định bảo mật nội bộ.',
    ],
    callout: {
      variant: 'shield',
      title: 'Khi có sự cố bảo mật',
      body: 'Nếu xảy ra rò rỉ thông tin, ValuCar sẽ khắc phục, báo cơ quan chức năng theo quy định và thông báo cho bạn khi pháp luật yêu cầu hoặc khi ảnh hưởng nghiêm trọng đến quyền lợi của bạn.',
    },
    footer:
      'Bạn nên cung cấp thông tin đúng sự thật, giữ bí mật mật khẩu và báo ngay nếu phát hiện ai đó đăng nhập trái phép vào tài khoản của bạn.',
  },
  {
    id: 'muc-6',
    number: '06',
    title: 'Quyền của bạn',
    icon: 'tabler:user-check',
    intro: 'Bạn có thể yêu cầu ValuCar:',
    bullets: [
      'Xem hoặc cập nhật thông tin trong mục Cài đặt, hoặc liên hệ qua email/form.',
      'Từ chối nhận tin quảng cáo (nếu ValuCar gửi trong tương lai).',
      'Yêu cầu xóa hoặc hạn chế sử dụng thông tin cá nhân trong phạm vi pháp luật cho phép.',
    ],
  },
  {
    id: 'muc-7',
    number: '07',
    title: 'Tiếp nhận khiếu nại',
    icon: 'tabler:headset',
    intro:
      'Nếu bạn cho rằng thông tin cá nhân bị dùng sai mục đích, vui lòng liên hệ:',
    footer:
      'ValuCar phản hồi trong vòng 7 ngày làm việc sau khi nhận đủ thông tin. Chúng tôi ưu tiên trao đổi và thỏa thuận; nếu không được, tranh chấp sẽ do Tòa án có thẩm quyền giải quyết theo pháp luật Việt Nam.',
  },
  {
    id: 'muc-8',
    number: '08',
    title: 'Thay đổi chính sách',
    icon: 'tabler:file-pencil',
    paragraphs: [
      'ValuCar có thể cập nhật chính sách khi thêm tính năng hoặc khi pháp luật thay đổi. Bản mới sẽ đăng tại trang này kèm ngày cập nhật. Bạn tiếp tục dùng dịch vụ sau khi công bố nghĩa là đã biết nội dung mới.',
    ],
  },
]
