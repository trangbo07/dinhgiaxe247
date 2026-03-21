'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phnumber: '',
    Message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [showThanks, setShowThanks] = useState(false)
  const [loader, setLoader] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const isValid = Object.values(formData).every(
      (value) => value.trim() !== ''
    )
    setIsFormValid(isValid)
  }, [formData])
  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }
  const reset = () => {
    formData.firstname = ''
    formData.lastname = ''
    formData.email = ''
    formData.phnumber = ''
    formData.Message = ''
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoader(true)

    fetch('https://formsubmit.co/ajax/arshvasani9@gmail.com', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({
        Name: formData.firstname,
        LastName: formData.lastname,
        Email: formData.email,
        PhoneNo: formData.phnumber,
        Message: formData.Message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSubmitted(true)
          setShowThanks(true)
          reset()

          setTimeout(() => {
            setShowThanks(false)
          }, 5000)
        }

        reset()
      })
      .catch((error) => {
        setLoader(false)
        console.log(error.message)
      })
  }
  return (
    <section id='contact' className='bg-gradient-to-br from-slate-50 to-white py-20'>
      <div className='container px-4 max-w-4xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl sm:text-5xl font-black mb-4 text-midnight_text'>
            Liên Hệ Với Chúng Tôi
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Có câu hỏi? Chúng tôi sẵn sàng trợ giúp và sẽ phản hồi trong vòng 24 giờ.
          </p>
        </div>

        <div className='bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12'>
          <form
            onSubmit={handleSubmit}
            className='space-y-6'>
            
            {/* Name Fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='fname' className='block text-sm font-bold text-midnight_text mb-3'>
                  👤 Tên
                </label>
                <input
                  id='fname'
                  type='text'
                  name='firstname'
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder='Nguyễn'
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base'
                />
              </div>
              <div>
                <label htmlFor='lname' className='block text-sm font-bold text-midnight_text mb-3'>
                  Họ
                </label>
                <input
                  id='lname'
                  type='text'
                  name='lastname'
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder='Văn'
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base'
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <div>
                <label htmlFor='email' className='block text-sm font-bold text-midnight_text mb-3'>
                  📧 Địa chỉ Email
                </label>
                <input
                  id='email'
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='nguyen.van@example.com'
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base'
                />
              </div>
              <div>
                <label htmlFor='phnumber' className='block text-sm font-bold text-midnight_text mb-3'>
                  📱 Số Điện Thoại
                </label>
                <input
                  id='phnumber'
                  type='tel'
                  name='phnumber'
                  placeholder='+84 123 456 789'
                  value={formData.phnumber}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base'
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor='message' className='block text-sm font-bold text-midnight_text mb-3'>
                💬 Tin Nhắn
              </label>
              <textarea
                id='message'
                name='Message'
                value={formData.Message}
                onChange={handleChange}
                rows={5}
                className='w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-base resize-none'
                placeholder='Bất kỳ thông tin nào khác bạn muốn chia sẻ'
              /></div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={!isFormValid || loader}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex justify-center items-center gap-2 ${
                !isFormValid || loader
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-2xl hover:scale-105'
              }`}>
              {loader ? (
                <>
                  <Icon icon='tabler:loader' className='animate-spin text-xl' /> Đang gửi...
                </>
              ) : (
                <>
                  <Icon icon='tabler:send' className='text-xl' /> Gửi Tin Nhắn
                </>
              )}
            </button>
          </form>

          {/* Success Message */}
          {showThanks && (
            <div className='mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 font-bold'>
              <Icon icon='tabler:check-circle' className='text-2xl text-emerald-500' />
              <div>
                <p>Cảm ơn bạn đã liên hệ!</p>
                <p className='text-sm'>Chúng tôi sẽ phản hồi sớm.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ContactForm
