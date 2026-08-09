// `height` is its own prop rather than something you pass through className:
// two competing `h-*` classes on one element resolve by CSS source order, not by
// the order they appear in the attribute, so overriding via className would be a
// coin toss. Keeping it separate means there is only ever one height class.
//
// The gutter is padding, not margin. With `w-full` a margin is added *outside*
// the 100% width, so the section ran 100% + both gutters wide and overflowed to
// the right, where the page's overflow-x-hidden quietly clipped it — which is
// why the inset only ever appeared on the left. Padding sits inside the width
// under border-box, so it lands evenly. No gutter at all on a phone, where the
// art wants the full width.
export default function Section({ id, className = '', height = 'h-[100dvh]', children }) {
  return (
    <section
      id={id}
      className={`flex ${height} w-full items-center justify-center px-0 md:px-6 ${className}`}
    >
      {children}
    </section>
  );
}
