import { motion, AnimatePresence } from 'framer-motion'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { auth, db } from './firebase'
import heroImg from './assets/hero.png'
import Preloader from './components/Preloader'

const defaultPortfolio = {
  home: {
    title_id: 'Bambang S',
    title_en: 'Bambang S',
    desc_id:
      'Saya adalah kreator digital yang suka membangun ide menjadi produk yang terasa hidup, menarik, dan bermanfaat untuk orang banyak.',
    desc_en:
      'I am a digital creator who enjoys turning ideas into products that feel alive, engaging, and meaningful for many people.',
  },
  about: {
    text_id:
      'Saya adalah seorang kreator yang antusias membangun pengalaman digital dengan kombinasi teknologi, visual, dan storytelling. Saya percaya ide yang ditata dengan baik bisa menghasilkan produk yang berdampak dan memukau.',
    text_en:
      'I am a creative individual who enjoys building digital experiences with a blend of technology, visuals, and storytelling. I believe well-crafted ideas can create meaningful and memorable products.',
  },
  skills: [
    {
      title_id: 'Coding',
      title_en: 'Coding',
      icon: '⚡',
      desc_id: 'Membangun produk digital yang cepat, scalable, dan modern.',
      desc_en: 'Building digital products that are fast, scalable, and modern.',
    },
    {
      title_id: 'Design',
      title_en: 'Design',
      icon: '🎨',
      desc_id: 'Menciptakan tampilan yang nyaman, kuat, dan mudah diingat.',
      desc_en: 'Crafting interfaces that feel clean, impactful, and memorable.',
    },
    {
      title_id: 'Editing',
      title_en: 'Editing',
      icon: '✂️',
      desc_id: 'Mengolah visual dan konten agar pesan lebih hidup dan jelas.',
      desc_en: 'Shaping visuals and content so the message feels clearer and more alive.',
    },
  ],
  contact: {
    wa: '+6281234567890',
    email: 'bambang.example@gmail.com',
    ig: '@bambang_s',
  },
  profilePhoto: heroImg,
  language: 'id',
}

const constellationDefs = [
  {
    name: 'ORION',
    points: [
      { x: 0.1, y: 0.18 },
      { x: 0.17, y: 0.25 },
      { x: 0.24, y: 0.22 },
      { x: 0.28, y: 0.34 },
      { x: 0.35, y: 0.4 },
      { x: 0.29, y: 0.52 },
      { x: 0.42, y: 0.58 },
    ],
    label: { x: 0.12, y: 0.1 },
  },
  {
    name: 'BIG DIPPER',
    points: [
      { x: 0.78, y: 0.2 },
      { x: 0.83, y: 0.28 },
      { x: 0.9, y: 0.26 },
      { x: 0.94, y: 0.35 },
      { x: 0.86, y: 0.42 },
      { x: 0.8, y: 0.52 },
      { x: 0.72, y: 0.61 },
    ],
    label: { x: 0.77, y: 0.12 },
  },
  {
    name: 'CASSIOPEIA',
    points: [
      { x: 0.34, y: 0.72 },
      { x: 0.41, y: 0.66 },
      { x: 0.48, y: 0.74 },
      { x: 0.56, y: 0.66 },
      { x: 0.63, y: 0.74 },
      { x: 0.7, y: 0.66 },
      { x: 0.77, y: 0.72 },
    ],
    label: { x: 0.5, y: 0.82 },
  },
]

const hexToRgba = (hex, alpha) => {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((char) => char + char).join('') : clean
  const bigint = Number.parseInt(full, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function useTypingEffect(words, typingSpeed = 120, deletingSpeed = 70, pauseTime = 1100) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex % words.length]
    let timeoutId

    if (!isDeleting && text === currentWord) {
      timeoutId = setTimeout(() => setIsDeleting(true), pauseTime)
      return () => clearTimeout(timeoutId)
    }

    if (isDeleting && text === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
      return undefined
    }

    timeoutId = setTimeout(() => {
      if (!isDeleting) {
        const nextText = currentWord.slice(0, text.length + 1)
        setText(nextText)
      } else {
        const nextText = currentWord.slice(0, text.length - 1)
        setText(nextText)
      }
    }, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeoutId)
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime])

  return text
}

function normalizePortfolioData(data) {
  const safe = data || {}
  return {
    home: { ...defaultPortfolio.home, ...(safe.home || {}) },
    about: { ...defaultPortfolio.about, ...(safe.about || {}) },
    skills: Array.isArray(safe.skills) && safe.skills.length ? safe.skills : defaultPortfolio.skills,
    contact: { ...defaultPortfolio.contact, ...(safe.contact || {}) },
    profilePhoto: safe.profilePhoto || defaultPortfolio.profilePhoto,
    language: safe.language || 'id',
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const maxWidth = 500
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function App() {
  const [route, setRoute] = useState(() => window.location.pathname)
  const [showPreloader, setShowPreloader] = useState(() => {
    // Only show on main public page, skip on admin
    return !window.location.pathname.startsWith('/admin')
  })
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('lang')
    return saved === 'en' || saved === 'id' ? saved : 'id'
  })
  const [portfolio, setPortfolio] = useState(defaultPortfolio)
  const [authUser, setAuthUser] = useState(null)
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const typedText = useTypingEffect(['Vibe Coder', 'Creator', 'Dreamer'])
  const canvasRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const docRef = doc(db, 'portfolio', 'main')
    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          await setDoc(docRef, defaultPortfolio, { merge: true })
          setPortfolio(defaultPortfolio)
          setLoadingPortfolio(false)
          return
        }

        setPortfolio(normalizePortfolioData(snapshot.data()))
        setLoadingPortfolio(false)
      },
      () => {
        setPortfolio(defaultPortfolio)
        setLoadingPortfolio(false)
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    localStorage.setItem('lang', language)
  }, [language])

  useEffect(() => {
    const handleLocationChange = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const stars = []
    const shootingStars = []
    let constellations = []

    const randomBetween = (min, max) => min + Math.random() * (max - min)

    const buildConstellations = () =>
      constellationDefs.map((constellation) => ({
        ...constellation,
        points: constellation.points.map((point) => ({
          x: point.x * window.innerWidth,
          y: point.y * window.innerHeight,
          radius: randomBetween(2.8, 4.8),
        })),
        label: {
          x: constellation.label.x * window.innerWidth,
          y: constellation.label.y * window.innerHeight,
        },
      }))

    const buildStars = () => {
      const total = 120
      stars.length = 0
      for (let index = 0; index < total; index += 1) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: randomBetween(0.8, 2.8),
          alpha: randomBetween(0.3, 1),
          twinkleSpeed: randomBetween(0.8, 2.5),
          offset: Math.random() * Math.PI * 2,
          depth: randomBetween(0.4, 1.8),
          color: index % 3 === 0 ? '#ffffff' : '#22d3ee',
        })
      }
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      constellations = buildConstellations()
      buildStars()
    }

    const handlePointerMove = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }

    const handlePointerLeave = () => {
      pointer.x = window.innerWidth / 2
      pointer.y = window.innerHeight / 2
    }

    const handleBackgroundClick = (event) => {
      const target = event.target
      if (target instanceof HTMLElement && target.closest('a, button, input, textarea')) {
        return
      }

      const angle = randomBetween(-1.25, 1.25)
      shootingStars.push({
        x: event.clientX,
        y: event.clientY,
        vx: Math.cos(angle + Math.PI / 2) * randomBetween(11, 17),
        vy: Math.sin(angle + Math.PI / 2) * randomBetween(11, 17),
        life: 1,
        length: randomBetween(55, 100),
      })
    }

    const drawStar = (star) => {
      const parallaxX = (pointer.x - window.innerWidth / 2) * star.depth * 0.05
      const parallaxY = (pointer.y - window.innerHeight / 2) * star.depth * 0.05
      const twinkle = 0.5 + Math.sin(performance.now() * 0.003 * star.twinkleSpeed + star.offset) * 0.5
      const alpha = Math.min(1, star.alpha * twinkle)

      ctx.beginPath()
      ctx.fillStyle = hexToRgba(star.color, alpha)
      ctx.arc(star.x + parallaxX, star.y + parallaxY, star.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawConstellation = (constellation) => {
      const active = constellation.points.some((point) => {
        const distance = Math.hypot(pointer.x - point.x, pointer.y - point.y)
        return distance < 110
      })

      for (let i = 0; i < constellation.points.length - 1; i += 1) {
        const from = constellation.points[i]
        const to = constellation.points[i + 1]

        ctx.beginPath()
        ctx.lineWidth = active ? 1.8 : 1.1
        ctx.strokeStyle = active ? 'rgba(125, 211, 252, 0.95)' : 'rgba(148, 163, 184, 0.4)'
        ctx.shadowBlur = active ? 18 : 10
        ctx.shadowColor = active ? '#67e8f9' : 'rgba(148, 163, 184, 0.4)'
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }

      ctx.shadowBlur = 0

      constellation.points.forEach((point) => {
        const glow = active ? 1.7 : 1.1
        ctx.beginPath()
        ctx.fillStyle = active ? '#e0f2fe' : '#dbeafe'
        ctx.shadowBlur = active ? 18 : 10
        ctx.shadowColor = '#67e8f9'
        ctx.arc(point.x, point.y, active ? 4.2 : 3.1 * glow, 0, Math.PI * 2)
        ctx.fill()
      })

      if (active) {
        ctx.fillStyle = '#dbeafe'
        ctx.font = '600 12px Inter, sans-serif'
        ctx.fillText(constellation.name, constellation.label.x, constellation.label.y)
      }
    }

    const drawShootingStar = (shot) => {
      const tailX = shot.x - shot.vx * shot.length * 0.12
      const tailY = shot.y - shot.vy * shot.length * 0.12

      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(shot.x, shot.y)
      ctx.strokeStyle = `rgba(191, 219, 254, ${0.8 * shot.life})`
      ctx.lineWidth = 2
      ctx.shadowBlur = 18
      ctx.shadowColor = '#a5f3fc'
      ctx.stroke()

      ctx.beginPath()
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * shot.life})`
      ctx.arc(shot.x, shot.y, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const star of stars) {
        drawStar(star)
      }

      for (const constellation of constellations) {
        drawConstellation(constellation)
      }

      for (let index = shootingStars.length - 1; index >= 0; index -= 1) {
        const shot = shootingStars[index]
        shot.x += shot.vx
        shot.y += shot.vy
        shot.life -= 0.016

        drawShootingStar(shot)

        if (shot.life <= 0) {
          shootingStars.splice(index, 1)
        }
      }

      for (let index = 0; index < stars.length; index += 1) {
        const star = stars[index]
        star.x += (pointer.x - window.innerWidth / 2) * 0.0006 * star.depth
        star.y += (pointer.y - window.innerHeight / 2) * 0.0006 * star.depth

        if (star.x < -10) star.x = window.innerWidth + 10
        if (star.x > window.innerWidth + 10) star.x = -10
        if (star.y < -10) star.y = window.innerHeight + 10
        if (star.y > window.innerHeight + 10) star.y = -10
      }

      requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)
    window.addEventListener('click', handleBackgroundClick)

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      window.removeEventListener('click', handleBackgroundClick)
    }
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setRoute(path)
  }

  const currentLanguage = language === 'en' ? 'en' : 'id'
  const isAdminPath = route.startsWith('/admin')

  if (isAdminPath) {
    return authUser ? (
      <AdminDashboard
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        onLogout={async () => {
          await signOut(auth)
          navigate('/admin')
        }}
      />
    ) : (
      <AdminLogin onLoginSuccess={() => navigate('/admin/dashboard')} />
    )
  }

  if (route === '/admin/dashboard' && !authUser) {
    return <AdminLogin onLoginSuccess={() => navigate('/admin/dashboard')} />
  }

  const homeTitle = currentLanguage === 'en' ? portfolio.home.title_en : portfolio.home.title_id
  const homeDesc = currentLanguage === 'en' ? portfolio.home.desc_en : portfolio.home.desc_id
  const aboutText = currentLanguage === 'en' ? portfolio.about.text_en : portfolio.about.text_id
  const profileImage = loadingPortfolio ? null : portfolio.profilePhoto

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AnimatePresence mode="wait">
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <header className="pt-6">
          <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
            <div className="text-lg font-semibold tracking-[0.22em] text-cyan-300">BAMBANG S</div>
            <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#home" className="transition hover:text-white">Home</a>
              <a href="#about" className="transition hover:text-white">About</a>
              <a href="#skills" className="transition hover:text-white">Skills</a>
              <a href="#contact" className="transition hover:text-white">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`rounded-full px-2 py-1 ${language === 'id' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-2 py-1 ${language === 'en' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}
                >
                  EN
                </button>
              </div>
              <a
                href={`https://wa.me/${portfolio.contact.wa.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="contact-btn inline-flex items-center rounded-full border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition"
              >
                Let&apos;s Talk
              </a>
            </div>
          </nav>
        </header>

        <main id="home" className="pb-16 pt-12 sm:pt-16 lg:pt-20">
          <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-7"
            >
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">Portfolio</p>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                {homeTitle}
              </h1>

              <div className="flex min-h-[3rem] items-center gap-3 text-xl text-slate-200 sm:text-2xl">
                <span className="text-slate-400">I&apos;m</span>
                <span className="typing-text font-semibold text-cyan-300">{typedText}</span>
                <span className="typing-cursor inline-block h-6 w-[2px] animate-pulse bg-cyan-300" />
              </div>

              <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">{homeDesc}</p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="contact-btn inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition"
                >
                  {currentLanguage === 'en' ? 'Contact Me' : 'Hubungi Saya'}
                </a>
                <a
                  href="#skills"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:scale-105 hover:border-cyan-400/60 hover:bg-cyan-500/10"
                >
                  {currentLanguage === 'en' ? 'My Skills' : 'Keahlian Saya'}
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="relative mx-auto flex w-full max-w-[360px] items-center justify-center"
            >
              <div className="absolute inset-10 rounded-full bg-cyan-500/20 blur-3xl" />
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="absolute inset-4 rounded-full border border-cyan-300/40" />
                <div className="profile-ring flex h-[290px] w-[290px] items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-3 shadow-[0_0_60px_rgba(34,211,238,0.15)] sm:h-[320px] sm:w-[320px]">
                  {loadingPortfolio ? (
                    <div className="h-full w-full animate-pulse rounded-full bg-gray-800" />
                  ) : (
                    <img
                      src={profileImage}
                      alt="Bambang S"
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          </section>

          <section id="about" className="pt-20 sm:pt-24">
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_20px_40px_rgba(15,23,42,0.25)] backdrop-blur-sm sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
                {currentLanguage === 'en' ? 'About Me' : 'Tentang Saya'}
              </p>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                {currentLanguage === 'en' ? 'Creative ideas with purpose' : 'Ide kreatif dengan tujuan'}
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">{aboutText}</p>
            </div>
          </section>

          <section id="skills" className="pt-20 sm:pt-24">
            <div className="mb-10 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">Skills</p>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                {currentLanguage === 'en' ? 'What I bring to the table' : 'Apa yang saya bawa'}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {portfolio.skills.map((skill, index) => {
                const title = currentLanguage === 'en' ? skill.title_en : skill.title_id
                const desc = currentLanguage === 'en' ? skill.desc_en : skill.desc_id

                return (
                  <motion.article
                    key={`${skill.title_id}-${index}`}
                    initial={{ opacity: 0, y: 48 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: index * 0.18, ease: 'easeOut' }}
                    className="skill-card rounded-3xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 to-blue-500/20 text-2xl shadow-glow">
                      {skill.icon}
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold text-white">{title}</h3>
                    <p className="text-base leading-7 text-slate-300">{desc}</p>
                  </motion.article>
                )
              })}
            </div>
          </section>

          <section id="contact" className="pt-20 sm:pt-24">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">
                {currentLanguage === 'en' ? 'Contact' : 'Kontak'}
              </p>
              <div className="mt-6 flex flex-col gap-4 text-base text-slate-200 sm:flex-row sm:justify-center">
                <a href={`https://wa.me/${portfolio.contact.wa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                  WA: {portfolio.contact.wa}
                </a>
                <a href={`mailto:${portfolio.contact.email}`} className="hover:text-cyan-300">
                  {portfolio.contact.email}
                </a>
                <a href={`https://instagram.com/${portfolio.contact.ig.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-cyan-300">
                  {portfolio.contact.ig}
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      onLoginSuccess()
    } catch (loginError) {
      setError(loginError.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_50px_rgba(8,145,178,0.18)]">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin</p>
        <h1 className="mt-4 text-3xl font-bold text-white">Login</h1>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-cyan-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-cyan-400"
              required
            />
          </div>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="contact-btn w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AdminDashboard({ portfolio, setPortfolio, onLogout }) {
  const [formData, setFormData] = useState(normalizePortfolioData(portfolio))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setFormData(normalizePortfolioData(portfolio))
  }, [portfolio])

  const updateField = (group, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [group]: { ...prev[group], [field]: value },
    }))
  }

  const updateSkill = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, skillIndex) =>
        skillIndex === index ? { ...skill, [field]: value } : skill,
      ),
    }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const base64 = await compressImage(file)
      setFormData((prev) => ({ ...prev, profilePhoto: base64 }))
      setMessage('Foto profil berhasil diproses dan siap disimpan.')
    } catch (error) {
      setMessage(error.message || 'Upload gagal')
    }
  }

  const handleProfilePhotoUrl = (value) => {
    setFormData((prev) => ({ ...prev, profilePhoto: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const dataToSave = {
        home: formData.home,
        about: formData.about,
        skills: formData.skills,
        contact: formData.contact,
        profilePhoto: formData.profilePhoto,
        language: formData.language || 'id',
      }

      await setDoc(doc(db, 'portfolio', 'main'), dataToSave, { merge: true })
      setPortfolio(normalizePortfolioData(formData))
      setMessage('Data berhasil disimpan ke Firestore.')
    } catch (error) {
      setMessage(error.message || 'Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const previewLanguage = formData.language === 'en' ? 'en' : 'id'
  const previewTitle = previewLanguage === 'en' ? formData.home.title_en : formData.home.title_id
  const previewDesc = previewLanguage === 'en' ? formData.home.desc_en : formData.home.desc_id
  const previewAbout = previewLanguage === 'en' ? formData.about.text_en : formData.about.text_id

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Portfolio Admin</h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="contact-btn inline-flex items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-200"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Home</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Title ID
                  <input
                    value={formData.home.title_id}
                    onChange={(event) => updateField('home', 'title_id', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Title EN
                  <input
                    value={formData.home.title_en}
                    onChange={(event) => updateField('home', 'title_en', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                  />
                </label>
              </div>
              <label className="block text-sm text-slate-300">
                Description ID
                <textarea
                  rows="3"
                  value={formData.home.desc_id}
                  onChange={(event) => updateField('home', 'desc_id', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Description EN
                <textarea
                  rows="3"
                  value={formData.home.desc_en}
                  onChange={(event) => updateField('home', 'desc_en', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                />
              </label>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">About</h2>
              <label className="block text-sm text-slate-300">
                About ID
                <textarea
                  rows="4"
                  value={formData.about.text_id}
                  onChange={(event) => updateField('about', 'text_id', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-slate-300">
                About EN
                <textarea
                  rows="4"
                  value={formData.about.text_en}
                  onChange={(event) => updateField('about', 'text_en', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                />
              </label>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Skills</h2>
              <div className="space-y-4">
                {formData.skills.map((skill, index) => (
                  <div key={`${skill.title_id}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="mb-3 flex gap-3">
                      <input
                        value={skill.icon || ''}
                        onChange={(event) => updateSkill(index, 'icon', event.target.value)}
                        className="w-16 rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-center text-white"
                      />
                      <input
                        value={skill.title_id}
                        onChange={(event) => updateSkill(index, 'title_id', event.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                        placeholder="Title ID"
                      />
                      <input
                        value={skill.title_en}
                        onChange={(event) => updateSkill(index, 'title_en', event.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                        placeholder="Title EN"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <textarea
                        rows="2"
                        value={skill.desc_id}
                        onChange={(event) => updateSkill(index, 'desc_id', event.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                        placeholder="Deskripsi ID"
                      />
                      <textarea
                        rows="2"
                        value={skill.desc_en}
                        onChange={(event) => updateSkill(index, 'desc_en', event.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                        placeholder="Description EN"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm text-slate-300">
                  WA
                  <input
                    value={formData.contact.wa}
                    onChange={(event) => updateField('contact', 'wa', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Email
                  <input
                    value={formData.contact.email}
                    onChange={(event) => updateField('contact', 'email', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                  />
                </label>
                <label className="text-sm text-slate-300">
                  Instagram
                  <input
                    value={formData.contact.ig}
                    onChange={(event) => updateField('contact', 'ig', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Profile Photo</h2>
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.profilePhoto || ''}
                  onChange={(event) => handleProfilePhotoUrl(event.target.value)}
                  placeholder="https://example.com/profile.jpg"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-slate-300"
                />
              </div>
              <div className="mt-4 flex justify-center">
                <img
                  src={formData.profilePhoto || heroImg}
                  alt="Preview"
                  className="h-48 w-48 rounded-full object-cover border border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Language</h2>
              <select
                value={formData.language || 'id'}
                onChange={(event) => setFormData((prev) => ({ ...prev, language: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <h3 className="mb-3 text-lg font-semibold text-white">Preview</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src={formData.profilePhoto} alt="Preview" className="h-14 w-14 rounded-full object-cover" />
                  <div>
                    <p className="text-xl font-bold text-white">{previewTitle}</p>
                    <p className="text-sm text-cyan-300">{previewLanguage === 'en' ? 'EN' : 'ID'}</p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-300">{previewDesc}</p>
                <p className="text-sm leading-7 text-slate-300">{previewAbout}</p>
              </div>
            </section>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="contact-btn w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
