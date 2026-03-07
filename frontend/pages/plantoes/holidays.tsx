import type { GetServerSideProps } from 'next'

export default function HolidaysPage() { return null }

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/plantoes?tab=holidays', permanent: false },
})
