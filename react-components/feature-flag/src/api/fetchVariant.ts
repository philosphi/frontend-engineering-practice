// Black-box dependency — assume this hits a real experimentation/assignment
// service. Not part of the exercise; stubbed here with a fake network delay
// and a random assignment so the hook has something to call.
//
// Real-world signature: fetchVariant(experimentId: string): Promise<string>

const VARIANTS = ['control', 'treatment']

export function fetchVariant(_experimentId: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
      resolve(variant)
    }, 500)
  })
}
