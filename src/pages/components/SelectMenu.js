import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

const departments = [
  { id: 0, name: 'Select Department', color: ''},
  { id: 1, name: 'Computer Studies', color: 'bg-blue-400', dbl: 'CS department' },
  { id: 2, name: 'Education', color: 'bg-green-400', dbl: 'Education Department' },
  { id: 3, name: 'Accountancy', color: 'bg-yellow-400', dbl: 'Accountancy Department' },
  { id: 4, name: 'Business Administration', color: 'bg-purple-400', dbl: 'Business Administration Department' },
  { id: 5, name: 'Arts and Sciences', color: 'bg-pink-400', dbl: 'Arts and Sciences Department' },
  { id: 6, name: 'Maritime', color: 'bg-teal-400', dbl: 'Maritime department'},
  { id: 7, name: 'Health Sciences', color: 'bg-red-400', dbl: 'Health Sciences Department'},
  { id: 8, name: 'Hospitality', color: 'bg-orange-400', dbl: 'Hospitality Management and Tourism Department' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function SelectMenu({ onChange }) {
  const [selected, setSelected] = useState(departments[0]);

  const handleChange = (department) => {
    setSelected(department)
    onChange(department.dbl)
  }

  return (
    <Listbox value={selected} onChange={handleChange}>
      {({ open }) => (
        <>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                <span
                  className={classNames(
                    selected.color,
                    'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                  )}
                />
                <span className="ml-3 block truncate">{selected.name}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {departments.map((department) => (
                  <Listbox.Option
                    key={department.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={department}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              department.color,
                              'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                          >
                            {department.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}