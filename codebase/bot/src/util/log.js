const C = { gray:'\x1b[90m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m',
            blue:'\x1b[34m', cyan:'\x1b[36m', bold:'\x1b[1m', off:'\x1b[0m' };
const on = process.stdout.isTTY && !process.env.NO_COLOR;
const p = (c, s) => (on ? c + s + C.off : s);

export const color = {
  gray:s=>p(C.gray,s), red:s=>p(C.red,s), green:s=>p(C.green,s),
  yellow:s=>p(C.yellow,s), blue:s=>p(C.blue,s), cyan:s=>p(C.cyan,s), bold:s=>p(C.bold,s),
};

const stamp = () => color.gray(new Date().toISOString().slice(11, 19));
export const log = {
  info:  (...a) => console.log(stamp(), color.blue('·'), ...a),
  ok:    (...a) => console.log(stamp(), color.green('✓'), ...a),
  warn:  (...a) => console.log(stamp(), color.yellow('!'), ...a),
  err:   (...a) => console.error(stamp(), color.red('✗'), ...a),
  step:  (...a) => console.log(stamp(), color.cyan('→'), ...a),
};
