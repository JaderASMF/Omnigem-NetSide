import type { GetServerSideProps } from 'next'

export default function WorkersRedirect() { return null }

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/plantoes?tab=workers', permanent: true },
})
