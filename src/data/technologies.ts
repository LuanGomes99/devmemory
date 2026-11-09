import {
  siAngular,
  siCss,
  siHtml5,
  siJavascript,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
  siVuedotjs,
} from 'simple-icons'
import type { Technology } from '../types/game'

const hex = (value: string) => `#${value}`

/**
 * Banco de tecnologias. Cada partida sorteia 8 delas.
 *
 * Os ícones vêm do pacote `simple-icons` (empacotados no bundle, funcionam offline).
 * Quando a cor oficial é preta ou some no fundo escuro, usamos a variação clara
 * que a própria marca adota em temas escuros.
 * O C# não existe no Simple Icons, então é desenhado localmente em `TechIcon`.
 */
export const TECHNOLOGIES: readonly Technology[] = [
  { id: 'javascript', name: 'JavaScript', color: hex(siJavascript.hex), path: siJavascript.path },
  { id: 'typescript', name: 'TypeScript', color: '#4C8FE0', path: siTypescript.path },
  { id: 'python', name: 'Python', color: '#4B8BBE', path: siPython.path },
  { id: 'java', name: 'Java', color: '#F89820', path: siOpenjdk.path },
  { id: 'csharp', name: 'C#', color: '#A35FC4', path: null },
  { id: 'php', name: 'PHP', color: hex(siPhp.hex), path: siPhp.path },
  { id: 'react', name: 'React', color: hex(siReact.hex), path: siReact.path },
  { id: 'nextjs', name: 'Next.js', color: '#F2F4F8', path: siNextdotjs.path },
  { id: 'vue', name: 'Vue.js', color: hex(siVuedotjs.hex), path: siVuedotjs.path },
  { id: 'angular', name: 'Angular', color: '#E23157', path: siAngular.path },
  { id: 'nodejs', name: 'Node.js', color: '#6CC24A', path: siNodedotjs.path },
  { id: 'tailwind', name: 'Tailwind CSS', color: hex(siTailwindcss.hex), path: siTailwindcss.path },
  { id: 'html5', name: 'HTML5', color: hex(siHtml5.hex), path: siHtml5.path },
  { id: 'css', name: 'CSS3', color: '#A57CDB', path: siCss.path },
  { id: 'postgresql', name: 'PostgreSQL', color: '#5B8DEF', path: siPostgresql.path },
  { id: 'mongodb', name: 'MongoDB', color: hex(siMongodb.hex), path: siMongodb.path },
]

export const TECH_BY_ID: ReadonlyMap<string, Technology> = new Map(
  TECHNOLOGIES.map((tech) => [tech.id, tech]),
)

export function getTech(id: string): Technology {
  const tech = TECH_BY_ID.get(id)
  if (!tech) throw new Error(`Tecnologia desconhecida: ${id}`)
  return tech
}
