/* Ficha de gramos junto al frasco: misma pieza y mismo gesto en Casa, Ubud y Atacama.
   Va en una caja que NO escala con el frasco y que mide lo que él a tamaño completo (la ficha
   sigue a su hombro, pero el texto no encoge). `escala`: la del frasco, con base en su pie. */
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/ficha-peso.css';

export default function FichaPeso({ tam, escala = 1, className = '' }) {
  return (
    <div className={`ficha-peso ${className}`.trim()} style={{ '--k': escala }} aria-hidden="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={tam}
          className="nota nota--derecha ficha-peso__nota"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {tam} g
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
