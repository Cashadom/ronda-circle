'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

import { createCircle } from '@/lib/circleService'
import {
  getCurrentUser,
  signInWithGoogle,
} from '@/lib/auth'


const CIRCLE_TYPES = [
  {
    value: 'friends',
    label: 'Friends',
    description:
      'Meet new people, make friends and build your local social circle.',
  },
  {
    value: 'date',
    label: 'Date',
    description:
      'Discover people open to dating and meaningful connections.',
  },
  {
    value: 'business',
    label: 'Business',
    description:
      'Meet professionals, founders, freelancers and people open to new opportunities.',
  },
]


export default function CreateCirclePage() {
  const router = useRouter()

  const [form, setForm] = useState({
    city: '',
    type: 'friends',
    description: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }


  async function submit(event) {
    event.preventDefault()

    setError('')

    const city =
      String(form.city || '')
        .trim()

    if (!city) {
      setError('City is required.')
      return
    }

    setLoading(true)

    try {
      let user =
        getCurrentUser()

      if (!user) {
        user =
          await signInWithGoogle()
      }

      const id =
        await createCircle(
          {
            city,
            type: form.type,
            description:
              String(
                form.description || ''
              ).trim(),
          },
          user
        )

      router.push(
        `/circles/${id}`
      )

    } catch (err) {
      console.error(
        'Unable to create Circle:',
        err
      )

      setError(
        err?.message ||
        'Unable to create this Circle.'
      )

    } finally {
      setLoading(false)
    }
  }


  const selectedType =
    CIRCLE_TYPES.find(
      (item) =>
        item.value ===
        form.type
    ) ||
    CIRCLE_TYPES[0]


  return (
    <>
      <Navbar />

      <main className="create-circle-page">

        <div className="create-circle-container">


          {/* HEADER */}

          <section className="create-circle-header">

            <p className="create-circle-eyebrow">
              Ronda Circles
            </p>

            <h1>
              Create a Circle
            </h1>

            <p className="create-circle-intro">
              Bring together people in your city
              around the same intention.
            </p>

            <p className="create-circle-note">
              Your Circle will be public.
              People can discover its members,
              join it and connect privately.
            </p>

          </section>


          {/* FORM */}

          <form
            className="create-circle-form"
            onSubmit={submit}
          >


            {/* CITY */}

            <div className="form-section">

              <div className="form-section-heading">

                <span className="form-number">
                  1
                </span>

                <div>

                  <label
                    htmlFor="circle-city"
                    className="form-label"
                  >
                    City
                  </label>

                  <p className="form-helper">
                    Where should this Circle appear?
                  </p>

                </div>

              </div>


              <input
                id="circle-city"
                type="text"
                value={form.city}
                onChange={(event) =>
                  update(
                    'city',
                    event.target.value
                  )
                }
                placeholder="Example: Bangalore"
                className="form-input"
                autoComplete="address-level2"
                maxLength={80}
                required
              />

            </div>


            {/* TYPE */}

            <div className="form-section">

              <div className="form-section-heading">

                <span className="form-number">
                  2
                </span>

                <div>

                  <span className="form-label">
                    What is this Circle for?
                  </span>

                  <p className="form-helper">
                    Choose the main reason people
                    should join.
                  </p>

                </div>

              </div>


              <div className="circle-types">

                {CIRCLE_TYPES.map(
                  (type) => {

                    const active =
                      form.type ===
                      type.value

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          update(
                            'type',
                            type.value
                          )
                        }
                        className={
                          active
                            ? `circle-type-option circle-type-${type.value} active`
                            : `circle-type-option circle-type-${type.value}`
                        }
                      >

                        <span className="type-name">
                          {type.label}
                        </span>

                        <span className="type-check">
                          {active
                            ? '✓'
                            : ''}
                        </span>

                      </button>
                    )
                  }
                )}

              </div>


              <p className="selected-type-description">
                {selectedType.description}
              </p>

            </div>


            {/* DESCRIPTION */}

            <div className="form-section">

              <div className="form-section-heading">

                <span className="form-number">
                  3
                </span>

                <div>

                  <label
                    htmlFor="circle-description"
                    className="form-label"
                  >
                    Description
                    <span className="optional">
                      optional
                    </span>
                  </label>

                  <p className="form-helper">
                    Give people a simple reason
                    to join.
                  </p>

                </div>

              </div>


              <textarea
                id="circle-description"
                value={form.description}
                onChange={(event) =>
                  update(
                    'description',
                    event.target.value
                  )
                }
                placeholder="Example: A Circle for people in Bangalore who want to meet new friends and expand their social life."
                className="form-textarea"
                maxLength={1000}
              />


              <div className="description-count">
                {form.description.length}
                /1000
              </div>

            </div>


            {/* PREVIEW */}

            <div className="circle-preview">

              <span className="preview-label">
                Your Circle
              </span>

              <div className="preview-content">

                <span
                  className={
                    `preview-type preview-type-${form.type}`
                  }
                >
                  {selectedType.label}
                </span>

                <strong className="preview-title">
                  {form.city.trim()
                    ? `Ronda Club · ${form.city.trim().toUpperCase()}`
                    : 'Ronda Club · YOUR CITY'}
                </strong>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="create-button"
              disabled={loading}
            >
              {loading
                ? 'Creating Circle...'
                : 'Create Circle'}
            </button>


            <p className="submit-note">
              The Circle creator automatically
              becomes its first member.
            </p>

          </form>

        </div>

      </main>

      <Footer />


      <style jsx>{`

        /* ================================================================
           PAGE
        ================================================================ */

        .create-circle-page {
          min-height: 100vh;

          padding:
            145px 20px 72px;

          box-sizing:
            border-box;

          background:
            #FFF8F2;

          color:
            #2B2725;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;
        }


        .create-circle-container {
          width:
            100%;

          max-width:
            720px;

          margin:
            0 auto;
        }


        /* ================================================================
           HEADER
        ================================================================ */

        .create-circle-header {
          margin-bottom:
            26px;
        }


        .create-circle-eyebrow {
          margin:
            0 0 8px;

          color:
            #FF6B5A;

          font-size:
            0.7rem;

          font-weight:
            700;

          letter-spacing:
            0.12em;

          text-transform:
            uppercase;
        }


        .create-circle-header h1 {
          margin:
            0 0 10px;

          color:
            #25211F;

          font-size:
            clamp(
              2rem,
              5vw,
              2.8rem
            );

          line-height:
            1.05;

          letter-spacing:
            -0.045em;
        }


        .create-circle-intro {
          max-width:
            580px;

          margin:
            0 0 5px;

          color:
            #5F5A56;

          font-size:
            0.96rem;

          line-height:
            1.55;
        }


        .create-circle-note {
          max-width:
            580px;

          margin:
            0;

          color:
            #9A918B;

          font-size:
            0.76rem;

          line-height:
            1.5;
        }


        /* ================================================================
           FORM
        ================================================================ */

        .create-circle-form {
          padding:
            30px;

          box-sizing:
            border-box;

          border:
            1px solid
            #E9DDD4;

          border-radius:
            22px;

          background:
            #FFFFFF;

          box-shadow:
            0 8px 30px
            rgba(
              43,
              39,
              37,
              0.035
            );
        }


        .form-section {
          padding:
            0 0 27px;

          margin:
            0 0 27px;

          border-bottom:
            1px solid
            #F0EBE6;
        }


        .form-section-heading {
          display:
            flex;

          align-items:
            flex-start;

          gap:
            11px;

          margin-bottom:
            15px;
        }


        .form-number {
          width:
            26px;

          height:
            26px;

          flex:
            0 0 26px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            50%;

          background:
            #FFF0EB;

          color:
            #FF604E;

          font-size:
            0.7rem;

          font-weight:
            750;
        }


        .form-label {
          display:
            flex;

          align-items:
            baseline;

          gap:
            7px;

          margin:
            0;

          color:
            #2B2725;

          font-size:
            0.94rem;

          font-weight:
            700;
        }


        .optional {
          color:
            #A39D98;

          font-size:
            0.65rem;

          font-weight:
            500;
        }


        .form-helper {
          margin:
            3px 0 0;

          color:
            #9A918B;

          font-size:
            0.72rem;

          line-height:
            1.4;
        }


        /* ================================================================
           INPUTS
        ================================================================ */

        .form-input,
        .form-textarea {
          width:
            100%;

          box-sizing:
            border-box;

          border:
            1px solid
            #E4DDD7;

          background:
            #FFFFFF;

          color:
            #393532;

          font-family:
            inherit;

          outline:
            none;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }


        .form-input {
          height:
            52px;

          padding:
            0 17px;

          border-radius:
            15px;

          font-size:
            0.9rem;
        }


        .form-textarea {
          min-height:
            125px;

          resize:
            vertical;

          padding:
            15px 17px;

          border-radius:
            15px;

          font-size:
            0.86rem;

          line-height:
            1.55;
        }


        .form-input::placeholder,
        .form-textarea::placeholder {
          color:
            #AAA39E;
        }


        .form-input:focus,
        .form-textarea:focus {
          border-color:
            #FFB7AB;

          box-shadow:
            0 0 0 3px
            rgba(
              255,
              107,
              90,
              0.06
            );
        }


        .description-count {
          margin-top:
            6px;

          text-align:
            right;

          color:
            #AAA39E;

          font-size:
            0.64rem;
        }


        /* ================================================================
           TYPES
        ================================================================ */

        .circle-types {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          gap:
            9px;
        }


        .circle-type-option {
          position:
            relative;

          min-height:
            52px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            8px;

          padding:
            0 15px;

          border:
            1px solid
            #E7E2DE;

          border-radius:
            14px;

          background:
            #FFFFFF;

          color:
            #706965;

          font-family:
            inherit;

          cursor:
            pointer;

          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            transform 0.18s ease;
        }


        .circle-type-option:hover {
          transform:
            translateY(-1px);

          border-color:
            #DCD4CE;
        }


        .circle-type-option.active {
          border-color:
            #FFC0B6;

          background:
            #FFF6F3;
        }


        .circle-type-date.active {
          border-color:
            #F1BAD1;

          background:
            #FFF5F9;
        }


        .circle-type-business.active {
          border-color:
            #BBD7F1;

          background:
            #F5F9FF;
        }


        .type-name {
          font-size:
            0.78rem;

          font-weight:
            700;
        }


        .circle-type-friends.active
        .type-name {
          color:
            #FF604E;
        }


        .circle-type-date.active
        .type-name {
          color:
            #D94D87;
        }


        .circle-type-business.active
        .type-name {
          color:
            #397DC1;
        }


        .type-check {
          width:
            18px;

          color:
            #FF604E;

          text-align:
            right;

          font-size:
            0.72rem;

          font-weight:
            800;
        }


        .circle-type-date.active
        .type-check {
          color:
            #D94D87;
        }


        .circle-type-business.active
        .type-check {
          color:
            #397DC1;
        }


        .selected-type-description {
          margin:
            10px 2px 0;

          color:
            #9A918B;

          font-size:
            0.69rem;

          line-height:
            1.5;
        }


        /* ================================================================
           PREVIEW
        ================================================================ */

        .circle-preview {
          display:
            flex;

          flex-direction:
            column;

          gap:
            8px;

          margin-bottom:
            20px;

          padding:
            15px 16px;

          border:
            1px solid
            #EEE7E2;

          border-radius:
            14px;

          background:
            #FCFAF8;
        }


        .preview-label {
          color:
            #A39D98;

          font-size:
            0.62rem;

          font-weight:
            700;

          letter-spacing:
            0.09em;

          text-transform:
            uppercase;
        }


        .preview-content {
          display:
            flex;

          align-items:
            center;

          gap:
            10px;

          min-width:
            0;
        }


        .preview-type {
          flex-shrink:
            0;

          display:
            inline-flex;

          padding:
            5px 10px;

          border-radius:
            999px;

          background:
            #FFF0EB;

          color:
            #FF604E;

          font-size:
            0.65rem;

          font-weight:
            700;
        }


        .preview-type-date {
          background:
            #FFF0F6;

          color:
            #D94D87;
        }


        .preview-type-business {
          background:
            #EDF5FF;

          color:
            #397DC1;
        }


        .preview-title {
          min-width:
            0;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;

          color:
            #393532;

          font-size:
            0.78rem;
        }


        /* ================================================================
           SUBMIT
        ================================================================ */

        .form-error {
          margin:
            -2px 0 15px;

          padding:
            10px 13px;

          border-radius:
            10px;

          background:
            #FFF1EF;

          color:
            #C94E45;

          font-size:
            0.75rem;

          line-height:
            1.4;
        }


        .create-button {
          width:
            100%;

          min-height:
            50px;

          border:
            none;

          border-radius:
            999px;

          background:
            #FF6B5A;

          color:
            #FFFFFF;

          font-family:
            inherit;

          font-size:
            0.84rem;

          font-weight:
            700;

          cursor:
            pointer;

          box-shadow:
            0 5px 14px
            rgba(
              255,
              107,
              90,
              0.18
            );

          transition:
            background 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }


        .create-button:hover:not(:disabled) {
          background:
            #F45542;

          transform:
            translateY(-1px);

          box-shadow:
            0 7px 18px
            rgba(
              255,
              107,
              90,
              0.23
            );
        }


        .create-button:disabled {
          opacity:
            0.6;

          cursor:
            wait;
        }


        .submit-note {
          margin:
            9px 0 0;

          text-align:
            center;

          color:
            #AAA39E;

          font-size:
            0.65rem;
        }


        /* ================================================================
           MOBILE
        ================================================================ */

        @media (max-width: 640px) {

          .create-circle-page {
            padding:
              128px 12px 44px;
          }


          .create-circle-header {
            padding:
              0 3px;

            margin-bottom:
              20px;
          }


          .create-circle-header h1 {
            font-size:
              1.8rem;
          }


          .create-circle-intro {
            font-size:
              0.86rem;
          }


          .create-circle-form {
            padding:
              20px 16px;

            border-radius:
              18px;
          }


          .form-section {
            padding-bottom:
              22px;

            margin-bottom:
              22px;
          }


          .circle-types {
            grid-template-columns:
              1fr;
          }


          .circle-type-option {
            min-height:
              48px;
          }


          .preview-content {
            align-items:
              flex-start;

            flex-direction:
              column;
          }


          .preview-title {
            width:
              100%;
          }

        }

      `}</style>

    </>
  )
}