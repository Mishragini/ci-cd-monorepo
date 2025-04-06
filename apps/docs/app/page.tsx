import { prismaClient } from "@repo/db/client"

export default async function Home() {
  const users = await prismaClient.user.findMany()

  if (!users) {
    return (
      <div>
        No users found.
      </div>
    )
  }
  return (
    <div >
      <div>
        {JSON.stringify(users)}
      </div>
    </div>
  );
}

export const revalidate = 60;