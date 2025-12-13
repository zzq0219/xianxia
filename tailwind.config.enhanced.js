/** @type {import('tailwindcss').Config} */
/**
 * Tailwind CSS 增强配置
 * 仙侠卡牌RPG游戏专用配置
 * 
 * 使用方法：将此文件内容合并到你的 tailwind.config.js 中
 */

module.exports = {
  theme: {
    extend: {
      // 仙侠主题色彩系统
      colors: {
        // 金色系 - 主色调
        'xianxia-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // 灵气蓝
        'spiritual': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 血煞红
        'blood': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // 仙韵紫
        'immortal': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },

      // 自定义动画
      animation: {
        // 脉冲发光
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        // 快速脉冲
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // 慢速旋转
        'spin-slow': 'spin 3s linear infinite',
        // 反向旋转
        'spin-reverse': 'spinReverse 3s linear infinite',
        // 漂浮
        'float': 'float 3s ease-in-out infinite',
        // 震动
        'shake': 'shake 0.5s',
        // 淡入上移
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        // 滑入
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        // 闪光扫过
        'shimmer': 'shimmer 2s infinite',
        // 彩虹边框
        'rainbow-border': 'rainbowBorder 3s linear infinite',
      },

      // 自定义关键帧
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(252, 211, 77, 0.5)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(252, 211, 77, 0.8)',
            transform: 'scale(1.05)',
          },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        fadeInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(-50px) scale(0.9)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        rainbowBorder: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },

      // 自定义阴影
      boxShadow: {
        'glow-gold': '0 0 20px rgba(252, 211, 77, 0.5)',
        'glow-gold-lg': '0 0 40px rgba(252, 211, 77, 0.8)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.5)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.5)',
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(252, 211, 77, 0.1)',
      },

      // 自定义模糊
      backdropBlur: {
        xs: '2px',
      },

      // 字体家族
      fontFamily: {
        'serif': ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        'xianxia': ['"Ma Shan Zheng"', '"STKaiti"', '"KaiTi"', 'serif'],
      },

      // 自定义间距
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // 自定义Z轴层级
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // 背景渐变位置
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '200%': '200% 200%',
      },

      // 自定义缓动函数
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  // 插件
  plugins: [
    // 滚动条样式插件
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-xianxia': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(41, 37, 36, 0.5)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, rgba(252, 211, 77, 0.6) 0%, rgba(245, 158, 11, 0.6) 100%)',
            borderRadius: '4px',
            border: '2px solid rgba(41, 37, 36, 0.5)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, rgba(252, 211, 77, 0.8) 0%, rgba(245, 158, 11, 0.8) 100%)',
          },
        },
        '.text-shadow-glow': {
          textShadow: '0 0 10px rgba(252, 211, 77, 0.5), 0 0 20px rgba(252, 211, 77, 0.3)',
        },
        '.text-shadow-strong': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}