import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Section from './Section';
import { useInView } from '../../hooks/useInView';
import { useIsMobile } from '../../hooks/useIsMobile';

// Filenames are capitalised on disk and hosts are usually case-sensitive, even
// though Windows lets the lowercase spelling pass locally.
const ART = {
  opened: { src: '/openedEnvelop.png', w: 364, h: 206 },
  front: { src: '/frontEnvelop.png', w: 535, h: 411 },
  closed: { src: '/closedEnvelop.png', w: 477, h: 247 },
  send: { src: '/Send.png', w: 724, h: 246 },
  sendAgain: { src: '/SendAgain.png', w: 1196, h: 503 },
  // "SendHeding" is the actual filename — the typo is on disk, so it has to be
  // spelled that way here or it 404s anywhere case- and spelling-sensitive.
  sendHeading: { src: '/SendHeding.png', w: 1380, h: 734 },
  messageHeading: { src: '/messageHeading.png', w: 2195, h: 827 },
};

// Callers position this themselves and always pass `absolute`. Do not add a
// second position utility here: Tailwind emits `.relative` after `.absolute`, so
// it would silently win and drop every layer into normal flow.
function EnvelopeLayer({ art, className, style }) {
  return (
    <div className={className} style={style}>
      <Image
        src={art.src}
        alt=""
        width={art.w}
        height={art.h}
        sizes="(max-width: 480px) 84vw, 26rem"
        className="h-auto w-full"
      />
    </div>
  );
}

// Every piece is drawn at the same width, so its height follows from its own
// aspect. Stacking the open flap above the front pocket gives the whole assembly
// its height, and the join between them is the fold line everything hinges on.
const H = Object.fromEntries(Object.entries(ART).map(([k, a]) => [k, a.h / a.w]));
const STACK_H = H.opened + H.front;
// Fold line — the top edge of the front pocket — as a fraction of the stack.
const FOLD = H.opened / STACK_H;

// Wider share of a phone than of a desktop. The pocket's height follows the
// stack width, while the page's height is its content in px and does not shrink
// with the screen — so on a narrow viewport the page outgrew the pocket and its
// tail hung out below the envelope once tucked. Widening here raises the pocket;
// the shorter mobile page below lowers the other side of the same inequality.
const STACK_W = 'min(26rem, 92vw)';
// Narrower than the pocket so it slips inside rather than sitting proud of it.
const LETTER_W = '86%';
// How much of the page stands clear of the envelope while it is being written.
// Everything writable has to fit inside this portion — at a smaller lift the
// name and email fell below the fold and were covered by the pocket. The page
// carries a blank tail below the fields so the part that does sit behind the
// pocket is empty paper.
const LETTER_LIFT = -70;

const PHASES = ['idle', 'tucking', 'folding', 'sealing', 'flying', 'sent'];
const TIMING = { tucking: 720, folding: 460, sealing: 460, flying: 1000 };
const from = (phase, name) => PHASES.indexOf(phase) >= PHASES.indexOf(name);

// Headings slide in from opposite edges when the section is reached. Offsets are
// in vw rather than percentages of the artwork, so both travel the same distance
// on screen despite being different widths.
const HEADING_SLIDE = 28;
const HEADING_EASE = 'cubic-bezier(.2,.8,.25,1)';

// The two arrive one after the other rather than together — the point of the
// stagger is that they read as two separate words landing, not one block.
//
// `show` also covers leaving: once the letter is on its way the headings retreat
// the way they came, so they are only up while there is something to write. The
// stagger is dropped on the way out — waiting on it would leave a word hanging
// around after the envelope has already gone.
const headingEntry = (show, reduced, { fromLeft, delay }) => {
  const wait = show ? delay : 0;
  return {
    transform: show ? 'translateX(0)' : `translateX(${fromLeft ? -HEADING_SLIDE : HEADING_SLIDE}vw)`,
    opacity: show ? 1 : 0,
    transition: reduced
      ? 'none'
      : `transform ${show ? 900 : 520}ms ${HEADING_EASE} ${wait}ms, opacity ${show ? 620 : 380
      }ms ease-out ${wait}ms`,
  };
};

export default function Contact() {
  const { ref: sectionRef, inView, reduced: reducedMotion } = useInView({ threshold: 0.3 });
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState('idle');
  const [form, setForm] = useState({ message: '', name: '', email: '' });
  const [error, setError] = useState('');
  const timers = useRef([]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const running = timers.current;
    return () => running.forEach(clearTimeout);
  }, []);

  const send = (e) => {
    e.preventDefault();

    if (phase !== 'idle') return;

    if (!form.message.trim()) {
      return setError('A message would help.');
    }

    if (!form.email.trim()) {
      return setError('An email, so she can write back.');
    }

    setError('');

    // Send in the background.
    // Don't wait for the response before starting the animation.
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        message: form.message,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Failed to send message');
        }

        console.log('Message sent successfully');
      })
      .catch((error) => {
        console.error('CONTACT FORM ERROR:', error);

        // Don't interrupt the envelope animation.
        // Tell the user after the animation finishes.
        setTimeout(() => {
          setError("Hmm, the message didn't quite make it. Please try again.");
        }, TIMING.tucking + TIMING.folding + TIMING.sealing + TIMING.flying);
      });

    // 🚀 Start animation immediately
    if (reduced.current) {
      return setPhase('sent');
    }

    let t = 0;

    timers.current = [
      ['tucking', 0],
      ['folding', (t += TIMING.tucking)],
      ['sealing', (t += TIMING.folding)],
      ['flying', (t += TIMING.sealing)],
      ['sent', (t += TIMING.flying)],
    ].map(([name, delay]) =>
      setTimeout(() => setPhase(name), delay)
    );
  };
  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setForm({ message: '', name: '', email: '' });
    setError('');
    setPhase('idle');
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const writing = phase === 'idle';
  const flying = from(phase, 'flying');

  return (
    <Section id="contact">
      <div
        ref={sectionRef}
        className="relative flex h-full w-full flex-col items-center justify-center gap-5"
      >
        {/* On a phone these overlap the envelope — it takes 84vw there — so they
            ride above it (z-20) to stay readable. On desktop there is room for
            the envelope to pass in front of them instead, which is the nicer
            depth cue, so they drop back to z-0. pointer-events-none throughout,
            so sitting over the letter or the Send button costs nothing. Each
            slides in from its own side when the section is reached. */}
        <Image
          src={ART.sendHeading.src}
          alt="Send"
          width={ART.sendHeading.w}
          height={ART.sendHeading.h}
          sizes="30vw"
          className="pointer-events-none absolute top-[10%] left-[20%] md:left-[18%] md:top-[26%] z-10 h-auto w-[min(20rem,30vw)] md:z-0"
          style={headingEntry(inView && writing, reducedMotion, { fromLeft: true, delay: 0 })}
        />
        <Image
          src={ART.messageHeading.src}
          alt="a message"
          width={ART.messageHeading.w}
          height={ART.messageHeading.h}
          sizes="36vw"
          className="pointer-events-none absolute bottom-[80%] right-[20%] md:bottom-[10%] md:right-[18%] z-10 h-auto w-[min(26rem,36vw)] md:z-0"
          style={headingEntry(inView && writing, reducedMotion, { fromLeft: false, delay: 260 })}
        />
        <div
          className="relative z-10"
          style={{
            width: STACK_W,
            aspectRatio: `1 / ${STACK_H}`,
            transform: flying ? 'translate(42vw, -72vh) rotate(22deg)' : 'none',
            opacity: flying ? 0 : 1,
            transition: flying
              ? 'transform 1s cubic-bezier(.55,0,.85,.2), opacity 1s ease-in'
              : 'none',
          }}
        >
          {/* Open flap. Sits directly above the pocket at the same width, then
              squashes to nothing with its bottom pinned to the fold — a scaleY
              collapse rather than a clip, so it foreshortens like paper folding
              away instead of being cut off. */}
          <EnvelopeLayer
            art={ART.opened}
            className="pointer-events-none absolute inset-x-0 top-0 z-10"
            style={{
              transformOrigin: 'bottom center',
              transform: `scaleY(${from(phase, 'folding') ? 0 : 1})`,
              transition: `transform ${TIMING.folding}ms cubic-bezier(.4,0,.25,1)`,
            }}
          />

          {/* The page. Its top lands exactly on the fold line, so by the end it is
              wholly behind the pocket; sitting below the pocket in z-order the
              whole time means no z-index swap is needed to tuck it. */}
          <div
            className="absolute left-1/2 z-20 -translate-x-1/2"
            style={{
              width: LETTER_W,
              top: `${FOLD * 100}%`,
              transform: `translateX(-50%) translateY(${from(phase, 'tucking') ? 0 : LETTER_LIFT}%)`,
              transition: `transform ${TIMING.tucking}ms cubic-bezier(.5,0,.2,1)`,
            }}
          >
            <form
              id="contact-letter"
              onSubmit={send}
              // pb-24 is the blank tail: it runs the page on past the last field
              // so the length that disappears into the pocket is empty paper.
              className="rounded-sm bg-[#fdfaf1] px-5 pb-24 pt-3 shadow-[0_8px_22px_rgba(60,50,30,.18)]"
              style={{
                // Ruling pitch must match the textarea's line-height below, or the
                // writing drifts off the lines as it fills up.
                backgroundImage:
                  'repeating-linear-gradient(#fdfaf1, #fdfaf1 25px, rgba(66,137,203,.16) 25px, rgba(66,137,203,.16) 26px)',
              }}
            >
              <p className="font-gochi text-lg text-navy-dark">To Shrutika,</p>

              <label className="sr-only" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={set('message')}
                disabled={!writing}
                // One row shorter on a phone. rows is an attribute, not a class,
                // so this cannot be a breakpoint.
                rows={isMobile ? 2 : 3}
                placeholder="say something nice…"
                className="mt-1 w-full resize-none bg-transparent font-gochi text-base leading-[26px] text-navy-dark placeholder:text-charcoal/50 focus:outline-none"
              />

              {/* Dropped below the message by whole multiples of the 26px ruling,
                  so the row still lands on a printed line: one line on a phone
                  where the page has to stay short, two on desktop. */}
              <div className="mt-[26px] flex flex-wrap items-baseline gap-x-2 font-gochi text-sm text-charcoal md:mt-[52px]">
                <span className="text-navy-dark">from</span>
                <label className="sr-only" htmlFor="contact-name">
                  Name
                </label>
                <input
                  id="contact-name"
                  value={form.name}
                  onChange={set('name')}
                  disabled={!writing}
                  placeholder="name"
                  className="min-w-0 flex-1 border-b border-charcoal/25 bg-transparent text-navy-dark placeholder:text-charcoal/50 focus:border-ocean focus:outline-none"
                />
                <label className="sr-only" htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  disabled={!writing}
                  placeholder="email"
                  className="min-w-0 flex-1 border-b border-charcoal/25 bg-transparent text-navy-dark placeholder:text-charcoal/50 focus:border-ocean focus:outline-none"
                />
              </div>

            </form>
          </div>

          {/* Front pocket, above the page so the page vanishes into it. */}
          <EnvelopeLayer
            art={ART.front}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
          />

          {/* Sits on the pocket rather than on the page. Below the fold the page
              is behind the pocket, so a button down here could not be drawn or
              clicked from inside the letter — it has to be its own layer above.
              The `form` attribute keeps it wired to the letter regardless. */}
          {writing && (
            <button
              type="submit"
              form="contact-letter"
              aria-label="Send"
              className="absolute left-1/2 z-50 w-[32%] -translate-x-1/2 -translate-y-1/2 transition-transform hover:-translate-y-[calc(50%+2px)] active:-translate-y-1/2"
              style={{ top: '72%' }}
            >
              <Image
                src={ART.send.src}
                alt="Send"
                width={ART.send.w}
                height={ART.send.h}
                sizes="9rem"
                className="h-auto w-full"
              />
            </button>
          )}

          {/* Closed flap. Hangs from the same fold line and grows downward over
              the pocket, picking up exactly where the open flap collapsed to 0. */}
          <EnvelopeLayer
            art={ART.closed}
            className="pointer-events-none absolute inset-x-0 z-40"
            style={{
              top: `${FOLD * 100}%`,
              transformOrigin: 'top center',
              transform: `scaleY(${from(phase, 'sealing') ? 1 : 0})`,
              transition: `transform ${TIMING.sealing}ms cubic-bezier(.4,0,.25,1)`,
            }}
          />
        </div>

        {/* Only the error sits here now — Send moved onto the page itself. */}
        <div className="flex min-h-[2rem] flex-col items-center">
          {writing && error && <p className="font-gochi text-sm text-plum">{error}</p>}
        </div>

        {/* Takes the middle of the section once the envelope has gone, rather
            than sitting under the empty space it left behind. */}
        {phase === 'sent' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={reset}
              aria-label="Send another"
              className="w-[min(16rem,52vw)] transition-transform hover:-translate-y-1"
            >
              <Image
                src={ART.sendAgain.src}
                alt="Send another"
                width={ART.sendAgain.w}
                height={ART.sendAgain.h}
                sizes="16rem"
                className="h-auto w-full"
              />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
