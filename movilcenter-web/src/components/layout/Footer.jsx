// src/components/layout/Footer.jsx
import { useQuery } from '@tanstack/react-query'
import { Share2, Heart, Music } from 'lucide-react'
import { configApi } from '../../lib/api'

export default function Footer() {
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => configApi.get(),
    select: (r) => r.data,
  })

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Heart,
      key: 'social_instagram',
      color: 'hover:text-pink-500',
    },
    {
      name: 'TikTok',
      icon: Music,
      key: 'social_tiktok',
      color: 'hover:text-black',
    },
    {
      name: 'Facebook',
      icon: Share2,
      key: 'social_facebook',
      color: 'hover:text-blue-600',
    },
  ]

  const activeSocials = socialLinks.filter((s) => config?.[s.key])

  return (
    <footer className="bg-[#011a3d] border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left content */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-lg mb-1">Síguenos en redes sociales</h3>
            <p className="text-slate-400 text-sm">Mantente actualizado con nuestras ofertas y novedades</p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-6">
            {activeSocials.length > 0 ? (
              activeSocials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.key}
                    href={config[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    className={`text-slate-400 transition-colors duration-200 ${social.color}`}
                  >
                    <Icon size={28} />
                  </a>
                )
              })
            ) : (
              <p className="text-slate-500 text-sm italic">Redes sociales no configuradas aún</p>
            )}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-slate-800 mt-8 pt-6">
          <div className="text-center text-slate-500 text-xs">
            <p>© {new Date().getFullYear()} {config?.store_name || 'Movilcenter Plus'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
