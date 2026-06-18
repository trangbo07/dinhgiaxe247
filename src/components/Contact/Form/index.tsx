'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import ContactChannels from '@/components/Contact/ContactChannels'
import { VALUCAR_CONTACT } from '@/lib/valucar-contact'
import { isValidVNPhone } from '@/utils/validatePhone'
import WorldCupSectionDecor, { WorldCupSectionLabel } from '@/components/WorldCupSectionDecor'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phnumber: '',
    Message: '',
  })
  const [showThanks, setShowThanks] = useState(false)
  const [loader, setLoader] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const allFilled = Object.values(formData).every((value) => value.trim() !== '')
    setIsFormValid(allFilled && isValidVNPhone(formData.phnumber))
  }, [formData])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }
  const reset = () => {
    setFormData({ firstname: '', lastname: '', email: '', phnumber: '', Message: '' })
    setPhoneError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValidVNPhone(formData.phnumber)) {
      setPhoneError('Số điện thoại không hợp lệ (vd: 0901234567)')
      return
    }
    setPhoneError('')
    setLoader(true)

    fetch(`https://formsubmit.co/ajax/${VALUCAR_CONTACT.email}`, {
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
        setLoader(false)
        if (data.success) {
          setShowThanks(true)
          reset()
          setTimeout(() => setShowThanks(false), 5000)
        }
      })
      .catch(() => {
        setLoader(false)
      })
  }
  return (
    <section id='contact' className='relative overflow-hidden bg-gradient-to-br from-slate-50 to-white py-20'>
      <WorldCupSectionDecor variant="contact" led />
      <div className='container relative z-10 mx-auto max-w-4xl px-4'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-4xl font-black text-midnight_text sm:text-5xl'>
            <WorldCupSectionLabel index={4}>Liên Hệ Với Chúng Tôi</WorldCupSectionLabel>
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Gọi, email hoặc nhắn Facebook — hoặc điền form bên dưới, chúng tôi phản hồi trong 24 giờ.
          </p>
        </div>

        <ContactChannels variant="cards" className="mb-10" />

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
                  placeholder='0901234567'
                  maxLength={11}
                  inputMode='tel'
                  value={formData.phnumber}
                  onChange={(e) => {
                    handleChange(e)
                    if (phoneError) setPhoneError('')
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-base ${
                    phoneError
                      ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
                  }`}
                />
                {phoneError && (
                  <p className='mt-1 text-xs text-red-500 flex items-center gap-1'>
                    <Icon icon='tabler:alert-circle' className='text-sm' />
                    {phoneError}
                  </p>
                )}
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
            <div className='mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/60 border-2 border-blue-200 rounded-xl flex items-center gap-3 text-blue-700 font-bold'>
              <Icon icon='tabler:check-circle' className='text-2xl text-blue-500' />
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
