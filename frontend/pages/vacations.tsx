import type { GetServerSideProps } from 'next'

export default function VacationsRedirect() { return null }

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/ferias', permanent: true },
})
