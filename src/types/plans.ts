export type plansData = {
  category: string[]
  heading: string
  button: string
  planCode: 'monthly' | 'quarterly' | 'yearly'
  price: {
    monthly: number
    yearly: number
  }
  subscriber: number
  imgSrc: string
  option: string[]
}